"use client";

import { signOut } from "next-auth/react";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { showConfirmDialog } from "@/components/ConfirmDialog";
import { useParams } from "next/navigation";

export default function Logout({ onClick, ...props }) {
  const autht = useTranslations("authmenu");
  const { locale } = useParams();

  const handleLogout = async () => {
    if (onClick) onClick();

    const confirmed = await showConfirmDialog({
      title: autht("title"),
      text: autht("text"),
      confirmButtonText: autht("confirm"),
      cancelButtonText: autht("cancel"),
    });

    if (confirmed) {
      await signOut({ redirect: false });
      toast.success("Logged out successfully");
      window.location.href = `/${locale}/dashboard`;
    }
  };

  return (
    <Button
      {...props}
      onClick={handleLogout}
      variant="outlined"
      color="error"
      fullWidth
      sx={{
        textTransform: "none",
        fontWeight: 500,
        borderRadius: 1,
        px: 1.5,
      }}
    >
      {autht("confirm")}
    </Button>
  );
}
