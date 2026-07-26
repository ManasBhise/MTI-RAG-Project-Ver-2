import logging
import os
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

try:
	from rag.config import GENERATED_DIAGRAMS_DIR
except ImportError:
	import sys
	PROJECT_ROOT = Path(__file__).resolve().parent.parent
	if str(PROJECT_ROOT) not in sys.path:
		sys.path.insert(0, str(PROJECT_ROOT))
	from rag.config import GENERATED_DIAGRAMS_DIR

logger = logging.getLogger(__name__)


def generate_meteorological_diagram(prompt: str) -> dict:
	"""Generate a high-quality scientific/meteorological visual diagram from a prompt.

	Saves the image locally and returns metadata including the relative web URL.
	"""
	GENERATED_DIAGRAMS_DIR.mkdir(parents=True, exist_ok=True)

	clean_prompt = prompt.strip()
	enhanced_prompt = (
		f"Scientific educational diagram of {clean_prompt}. "
		"Clear labels, clean layout, professional meteorological training illustration, high resolution"
	)

	diagram_id = f"diag_{uuid.uuid4().hex[:12]}"
	output_filename = f"{diagram_id}.jpg"
	save_path = GENERATED_DIAGRAMS_DIR / output_filename
	web_url = f"/static/generated_diagrams/{output_filename}"

	openai_api_key = os.getenv("OPENAI_API_KEY")

	# Option A: OpenAI DALL-E if API Key is configured
	if openai_api_key:
		for model_choice in ["dall-e-3", "dall-e-2"]:
			try:
				import openai
				client = openai.OpenAI(api_key=openai_api_key)
				size_val = "1024x1024"
				response = client.images.generate(
					model=model_choice,
					prompt=enhanced_prompt[:950],
					size=size_val,
					n=1,
				)
				img_url = response.data[0].url
				req = urllib.request.Request(img_url, headers={"User-Agent": "Mozilla/5.0"})
				with urllib.request.urlopen(req) as resp, open(save_path, "wb") as f:
					f.write(resp.read())

				return {
					"url": web_url,
					"caption": f"AI Diagram: {clean_prompt}",
					"provider": f"OpenAI {model_choice.upper()}",
				}
			except Exception as exc:
				logger.warning("OpenAI %s generation failed: %s.", model_choice, exc)
				continue

	# Option B: Free Pollinations FLUX API (Zero API key required)
	try:
		encoded = urllib.parse.quote(enhanced_prompt)
		seed = abs(hash(clean_prompt)) % 999999
		image_service_url = f"https://image.pollinations.ai/prompt/{encoded}?width=1024&height=768&seed={seed}&nologo=true&model=flux"

		req = urllib.request.Request(image_service_url, headers={"User-Agent": "MTI-Assistant/1.0"})
		with urllib.request.urlopen(req, timeout=30) as resp, open(save_path, "wb") as f:
			f.write(resp.read())

		return {
			"url": web_url,
			"caption": f"AI Diagram: {clean_prompt}",
			"provider": "Pollinations FLUX AI",
		}
	except Exception as exc:
		logger.exception("Diagram generation failed: %s", exc)
		raise RuntimeError(f"Unable to generate diagram: {exc}")
