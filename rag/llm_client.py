import logging
import os
import json
from typing import Any

from rag.config import (
	GEMINI_API_KEY,
	GEMINI_MODEL,
	GROQ_API_KEY,
	GROQ_MODEL,
	OPENAI_API_KEY,
	OPENAI_MODEL,
	PRIMARY_LLM_PROVIDER,
)

logger = logging.getLogger(__name__)

ACTIVE_GROQ_MODELS = [
	"llama-3.3-70b-versatile",
	"llama-3.1-8b-instant",
	"llama-3.2-3b-preview",
	"llama3-70b-8192",
	"llama3-8b-8192",
]

ACTIVE_GEMINI_MODELS = [
	"gemini-1.5-flash",
	"gemini-2.0-flash",
	"gemini-1.5-pro",
	"gemini-pro",
]

ACTIVE_OPENAI_MODELS = [
	"gpt-4o-mini",
	"gpt-4o",
	"gpt-3.5-turbo",
]


def _call_gemini_via_sdk(api_key: str, model_name: str, messages: list[dict], temperature: float, max_tokens: int) -> str:
	"""Invoke Gemini using the official google.generativeai SDK."""
	import google.generativeai as genai

	genai.configure(api_key=api_key)

	# Extract system prompt if present
	system_prompt = None
	conversation_contents = []

	for msg in messages:
		role = msg.get("role", "user")
		content = msg.get("content", "")
		if role == "system":
			system_prompt = content
		elif role == "assistant":
			conversation_contents.append({"role": "model", "parts": [content]})
		else:  # user
			conversation_contents.append({"role": "user", "parts": [content]})

	generation_config = genai.types.GenerationConfig(
		temperature=temperature,
		max_output_tokens=max_tokens,
	)

	model = genai.GenerativeModel(
		model_name=model_name,
		system_instruction=system_prompt if system_prompt else None,
		generation_config=generation_config,
	)

	response = model.generate_content(conversation_contents)
	if response and response.text:
		return response.text.strip()
	return ""


def _call_gemini_via_rest(api_key: str, model_name: str, messages: list[dict], temperature: float, max_tokens: int) -> str:
	"""Direct REST API fallback for Google Gemini (zero external SDK dependency)."""
	import requests

	clean_model = model_name.replace("models/", "")
	url = f"https://generativelanguage.googleapis.com/v1beta/models/{clean_model}:generateContent?key={api_key}"

	system_prompt = None
	contents = []

	for msg in messages:
		role = msg.get("role", "user")
		content = msg.get("content", "")
		if role == "system":
			system_prompt = content
		elif role == "assistant":
			contents.append({"role": "model", "parts": [{"text": content}]})
		else:
			contents.append({"role": "user", "parts": [{"text": content}]})

	payload: dict[str, Any] = {
		"contents": contents,
		"generationConfig": {
			"temperature": temperature,
			"maxOutputTokens": max_tokens,
		},
	}

	if system_prompt:
		payload["systemInstruction"] = {
			"parts": [{"text": system_prompt}]
		}

	headers = {"Content-Type": "application/json"}
	resp = requests.post(url, headers=headers, json=payload, timeout=10)
	resp.raise_for_status()

	data = resp.json()
	candidates = data.get("candidates", [])
	if candidates:
		parts = candidates[0].get("content", {}).get("parts", [])
		if parts:
			return parts[0].get("text", "").strip()
	return ""


def _call_gemini(api_key: str, model_name: str, messages: list[dict], temperature: float, max_tokens: int) -> str:
	"""Call Gemini trying SDK first, then REST API fallback."""
	models_to_try = [model_name] + [m for m in ACTIVE_GEMINI_MODELS if m != model_name]
	models_to_try = list(dict.fromkeys(models_to_try))

	last_err = None
	for target_model in models_to_try:
		# 1. Try SDK
		try:
			text = _call_gemini_via_sdk(api_key, target_model, messages, temperature, max_tokens)
			if text:
				return text
		except Exception as sdk_err:
			logger.debug("Gemini SDK call (%s) error: %s. Trying direct REST...", target_model, sdk_err)
			# 2. Try REST
			try:
				text = _call_gemini_via_rest(api_key, target_model, messages, temperature, max_tokens)
				if text:
					return text
			except Exception as rest_err:
				last_err = rest_err
				err_str = str(rest_err)
				logger.warning("Gemini model %s failed (REST: %s).", target_model, rest_err)
				# If key is invalid (400, 401, 403, 404), fail fast instead of looping through all models
				if any(code in err_str for code in ["400", "401", "403", "404", "API_KEY"]):
					break
				continue

	if last_err:
		raise last_err
	return ""


def _call_groq(api_key: str, model_name: str, messages: list[dict], temperature: float, max_tokens: int) -> str:
	"""Invoke Groq LLM across available models."""
	from groq import Groq

	client = Groq(api_key=api_key)
	models_to_try = [model_name] + [m for m in ACTIVE_GROQ_MODELS if m != model_name]
	models_to_try = list(dict.fromkeys(models_to_try))

	last_err = None
	for target_model in models_to_try:
		try:
			res = client.chat.completions.create(
				model=target_model,
				messages=messages,
				temperature=temperature,
				max_tokens=max_tokens,
			)
			content = (res.choices[0].message.content or "").strip()
			if content:
				return content
		except Exception as err:
			last_err = err
			logger.warning("Groq model %s failed: %s. Retrying next active model...", target_model, err)
			continue

	if last_err:
		raise last_err
	return ""


def _call_openai(api_key: str, model_name: str, messages: list[dict], temperature: float, max_tokens: int) -> str:
	"""Invoke OpenAI LLM across available models."""
	from openai import OpenAI

	client = OpenAI(api_key=api_key)
	models_to_try = [model_name] + [m for m in ACTIVE_OPENAI_MODELS if m != model_name]
	models_to_try = list(dict.fromkeys(models_to_try))

	last_err = None
	for target_model in models_to_try:
		try:
			res = client.chat.completions.create(
				model=target_model,
				messages=messages,
				temperature=temperature,
				max_tokens=max_tokens,
			)
			content = (res.choices[0].message.content or "").strip()
			if content:
				return content
		except Exception as err:
			last_err = err
			logger.warning("OpenAI model %s failed: %s. Retrying next model...", target_model, err)
			continue

	if last_err:
		raise last_err
	return ""


def call_llm(
	messages: list[dict],
	temperature: float = 0.1,
	max_tokens: int = 1500,
	preferred_provider: str | None = None,
) -> str:
	"""
	Execute LLM inference through a resilient fallback cascade.
	Priority Order:
	  1. Google Gemini (1M TPM, 1500 RPD)
	  2. Groq (Llama-3.3-70B / 3.1-8B)
	  3. OpenAI (GPT-4o-mini)
	"""
	gemini_key = (os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or GEMINI_API_KEY or "").strip()
	gemini_model = os.getenv("GEMINI_MODEL") or GEMINI_MODEL or "gemini-1.5-flash"

	groq_key = (os.getenv("GROQ_API_KEY") or GROQ_API_KEY or "").strip()
	groq_model = os.getenv("GROQ_MODEL") or GROQ_MODEL or "llama-3.3-70b-versatile"

	openai_key = (os.getenv("OPENAI_API_KEY") or OPENAI_API_KEY or "").strip()
	openai_model = os.getenv("OPENAI_MODEL") or OPENAI_MODEL or "gpt-4o-mini"

	primary = (preferred_provider or os.getenv("PRIMARY_LLM_PROVIDER") or PRIMARY_LLM_PROVIDER or "groq").lower()

	# Build provider order
	order = [primary]
	for p in ["groq", "gemini", "openai"]:
		if p not in order:
			order.append(p)

	last_exception = None

	for provider in order:
		try:
			if provider == "gemini" and gemini_key:
				logger.info("Executing LLM call via Google Gemini (model: %s)...", gemini_model)
				result = _call_gemini(gemini_key, gemini_model, messages, temperature, max_tokens)
				if result:
					return result

			elif provider == "groq" and groq_key:
				logger.info("Executing LLM call via Groq (model: %s)...", groq_model)
				result = _call_groq(groq_key, groq_model, messages, temperature, max_tokens)
				if result:
					return result

			elif provider == "openai" and openai_key:
				logger.info("Executing LLM call via OpenAI (model: %s)...", openai_model)
				result = _call_openai(openai_key, openai_model, messages, temperature, max_tokens)
				if result:
					return result

		except Exception as exc:
			last_exception = exc
			logger.warning(
				"[LLM Fallback Cascade] Provider '%s' encountered an error or rate limit: %s. Cascading to next provider...",
				provider,
				exc,
			)
			continue

	if last_exception:
		logger.error("All LLM providers in cascade failed. Last error: %s", last_exception)
		raise last_exception

	raise RuntimeError("No valid LLM API keys configured (GEMINI_API_KEY, GROQ_API_KEY, or OPENAI_API_KEY).")
