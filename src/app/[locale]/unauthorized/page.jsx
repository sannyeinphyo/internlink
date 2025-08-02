"use client";

import { useRouter, usePathname } from "next/navigation";
import {Box, Button, Typography } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { motion } from "framer-motion";
import Image from "next/image";

export default function UnauthorizedPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.split("/")[1];

  const handleLoginRedirect = () => {
    router.push(`/${locale}/login`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-md bg-white/70 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-2xl p-8 shadow-xl text-center max-w-md w-full"
      >
        <LockOutlinedIcon sx={{ fontSize: 72 }} className="text-red-500 mb-4" />
        <Typography variant="h5" mb={2} className="font-bold text-gray-800 dark:text-white mb-2">
          Access Denied
        </Typography>
        <Box alignContent={"center"} width ={"100%"} mb={2}>
        <Image src={`/auth/unauth.png`} width={400} height={400} alt="Unauthorized"></Image>
        </Box>
        
        <Typography variant="body1" className="text-gray-600 dark:text-gray-300 mb-6">
          You don&lsquo;t have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          mt={2}
          size="large"
          onClick={handleLoginRedirect}
          className="bg-blue-600 mt-4 hover:bg-blue-700 transition-all duration-200 shadow-md"
        >
          Go to Login
        </Button>
      </motion.div>
    </div>
  );
}
