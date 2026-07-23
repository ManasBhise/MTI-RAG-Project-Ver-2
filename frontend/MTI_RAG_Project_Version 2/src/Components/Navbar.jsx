import { AppBar, Avatar, Box, Button, IconButton, Toolbar, Typography } from "@mui/material";

function Navbar({ onToggleSidebar, userName = "User", onLogout }) {
	return (
		<AppBar
			position="static"
			elevation={0}
			sx={{
				bgcolor: "background.paper",
				color: "text.primary",
				borderBottom: "1px solid",
				borderColor: "divider",
			}}
		>
			<Toolbar sx={{ minHeight: 64, gap: 1 }}>
				<IconButton
					onClick={onToggleSidebar}
					edge="start"
					sx={{ display: { xs: "inline-flex", md: "none" } }}
					aria-label="open sidebar"
				>
					<Typography variant="h6" component="span">
						≡
					</Typography>
				</IconButton>

				<Typography variant="h6" sx={{ flexGrow: 1 }}>
					MTI Knowledge Assistant
				</Typography>

				<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
					<Avatar sx={{ width: 32, height: 32 }}>{userName?.charAt(0)?.toUpperCase() || "U"}</Avatar>
					<Typography variant="body2" sx={{ display: { xs: "none", sm: "inline" } }}>
						{userName}
					</Typography>
					<Button variant="outlined" size="small" onClick={onLogout}>
						Logout
					</Button>
				</Box>
			</Toolbar>
		</AppBar>
	);
}

export default Navbar;
