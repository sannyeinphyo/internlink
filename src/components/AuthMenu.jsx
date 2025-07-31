"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IconButton, Menu, MenuItem, Typography } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { ButtonPrimary, ButtonOutline } from "@/components/Button";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import LogoutButton from "@/components/Logout";
import axios from "axios";
import NotificationBell from "./NotificationBell";
import { useSession } from "next-auth/react";

export default function AuthMenu() {
  const [profileImage, setProfileImage] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const { locale } = useParams();
  const t = useTranslations("NavBar");
  const { data: session, status } = useSession();

  useEffect(() => {
    async function fetchProfileImage() {
      if (session?.user?.image) {
        setProfileImage({ image: session.user.image });
        return;
      }

      try {
        const res = await axios.get("/api/user/image");
        setProfileImage(res.data.user);
      } catch (err) {
        console.error("Failed to fetch profile image", err);
      }
    }

    if (status === "authenticated") {
      fetchProfileImage();
    }
  }, [session, status]);

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (!session?.user) {
    return (
      <>
        <Link href={`/${locale}/login`}>
          <ButtonPrimary>{t("Login")}</ButtonPrimary>
        </Link>
        <Link href={`/${locale}/register`}>
          <ButtonOutline>{t("Signup")}</ButtonOutline>
        </Link>
      </>
    );
  }

  return (
    <>
      <NotificationBell userId={session?.user?.id}/>

 <IconButton
  onClick={handleProfileClick}
  sx={{
    color: "textmain.main",
    p: 0,
    boxShadow: 2,
    border: "2px solid #4242425e",
    transition: "transform .3s",
    "&:hover": {
      transform: "scale(1.15)",
    },
  }}
  size="large"
  aria-controls={open ? "profile-menu" : undefined}
  aria-haspopup="true"
  aria-expanded={open ? "true" : undefined}
>
  <img
    src={profileImage?.image || "/placeholder-image.jpg"}
    alt="Profile"
    style={{
      width: 55,
      height: 55,
      borderRadius: "50%",
      objectFit: "cover",
    }}
  />
</IconButton>



      <Menu
        id="profile-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 180,
            boxShadow: 3,
            borderRadius: 2,
            p: 1,
          },
        }}
      >
        <MenuItem disabled sx={{ opacity: 1, cursor: "default" }}>
          <Typography variant="subtitle2" fontWeight="bold" noWrap>
            {session.user.name || session.user.email}
          </Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            router.push(`/${locale}/student/profile`);
          }}
          sx={{
            "&:hover": {
              bgcolor: "primary.light",
              color: "white",
            },
            borderRadius: 1,
            mt: 1,
          }}
        >
          <Typography variant="body2">Profile</Typography>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClose();
            router.push(`/${locale}/student/bookmarks`); 
          }}
          sx={{
            "&:hover": {
              bgcolor: "primary.light",
              color: "white",
            },
            borderRadius: 1,
            mt: 1,
          }}
        >
          <Typography variant="body2">Bookmarks</Typography>
        </MenuItem>

        <MenuItem disableRipple sx={{ mt: 1 }}>
          <LogoutButton onClick={handleClose} />
        </MenuItem>
      </Menu>
    </>
  );
}
