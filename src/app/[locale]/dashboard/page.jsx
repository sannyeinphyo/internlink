"use client";
import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Paper, IconButton } from "@mui/material";
import { ButtonPrimary, ButtonOutline } from "../../../components/Button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Facebook, LinkedIn, Email } from "@mui/icons-material";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import axios from "axios";
import { Typewriter } from "react-simple-typewriter";
import Image from "next/image";
import { useSession } from "next-auth/react";
export default function Dashboard() {
  const t = useTranslations("StudentDashboard");
  const stepst = useTranslations("steps");
  const populart = useTranslations("PopularCategories");
  const footert = useTranslations("footer");
  const [showFooter, setShowFooter] = useState(true);
  const { locale } = useParams();
  const [partnerCompany, setPartnerCompany] = useState([]);
  const [Loading, setLoading] = useState(false);
  const { data: session, status } = useSession();

  const linkStyle = {
    textDecoration: "none",
    color: "white",
    "&:hover": { textDecoration: "underline" },
  };
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;
      const nearBottom = scrollTop + windowHeight >= docHeight - 100;

      if (nearBottom || scrollTop === 0) {
        setShowFooter(true);
      } else {
        setShowFooter(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchPartners = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/partner_companies");
        setPartnerCompany(res.data.data || []);
      } catch (err) {
        console.error("Failed to fetch partners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, []);

  return (
    <Box>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, scale: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <Box
          sx={{
            height: "40vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 2,
            textAlign: "center",
            paddingTop: "2rem",
          }}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "48px",
              maxWidth: "auto",
              color: "textmain.main",
              textAlign: "center",
            }}
          >
            {t("HeaderText")}
          </Typography>

          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "48px",
              maxWidth: "auto",
              color: "buttonmain.main",
              textAlign: "center",
            }}
          >
            <Typewriter
              words={[t("HeaderText2")]}
              loop={1}
              cursor
              cursorStyle="_"
              typeSpeed={100}
              deleteSpeed={50}
              delaySpeed={3000}
            />
          </Typography>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              position: "relative",
              zIndex: 0,
              justifyContent: "center",
            }}
          >
            <Link href={`/${locale}/jobs`} passHref>
              <ButtonPrimary>{t("BrowseJobs")}</ButtonPrimary>
            </Link>
            {!session && (
              <Link href={`/${locale}/register`}>
                <ButtonOutline>{t("Signup")}</ButtonOutline>
              </Link>
            )}
            {session && (
              <Link href={`/${locale}/applications`}>
                <ButtonOutline>{t("applications")}</ButtonOutline>
              </Link>
            )}
          </Box>
        </Box>
      </motion.div>

      <Box sx={{ py: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            {t("HowItWorks")}
          </Typography>
          <Typography align="center" sx={{ maxWidth: 700, mx: "auto", mb: 6 }}>
            {t("WhatIsLinkIn")}
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {[
            {
              title: stepst("step1.title"),
              desc: stepst("step1.description"),
            },
            {
              title: stepst("step2.title"),
              desc: stepst("step2.description"),
            },
            {
              title: stepst("step3.title"),
              desc: stepst("step3.description"),
            },
          ].map((step, i) => (
            <Grid item xs={10} sm={6} md={4} key={i}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: i * 0.2 }}
              >
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    textAlign: "center",
                    borderRadius: 3,
                    transition: "0.3s",
                    "&:hover": {
                      transform: "scale(1.02)",
                      color: "buttonmain.main",
                    },
                  }}
                >
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    {step.title}
                  </Typography>
                  <Typography>{step.desc}</Typography>
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ py: 10 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            {populart("title")}
          </Typography>
          <Typography align="center" sx={{ maxWidth: 700, mx: "auto", mb: 6 }}>
            {populart("description")}
          </Typography>
        </motion.div>

        <Grid container spacing={3} justifyContent="center">
          {[
            "Software Development",
            "Graphic Design",
            "Frontend Development",
            "Finance",
            "Data Science",
            "Backend",
          ].map((category, idx) => (
            <Grid item xs={10} sm={6} md={4} lg={3} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ duration: 0.3, delay: idx * 0.1 }}
              >
                <Paper
                  elevation={2}
                  sx={{
                    py: 3,
                    px: 2,
                    textAlign: "center",
                    fontWeight: "bold",
                    borderRadius: 2,
                    cursor: "pointer",
                    transition: "0.3s",
                    "&:hover": {
                      bgcolor: "buttonmain.light",
                      color: "buttonmain.main",
                      transform: "scale(1.05)",
                    },
                  }}
                >
                  {category}
                </Paper>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ minHeight: "100vh", pt: 8, pb: 12 }}>
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          transition={{ duration: 0.6 }}
        >
          <Typography variant="h4" align="center" gutterBottom>
            {populart("featuredTitle")}
          </Typography>
          <Typography
            align="center"
            sx={{ maxWidth: "600px", mx: "auto", mb: 4 }}
          >
            {populart("featuredDescription")}
          </Typography>
        </motion.div>

        <Grid container spacing={4} justifyContent="center">
          {Loading && <p>Loading...</p>}
          {partnerCompany.map((item, index) => (
            <Grid item xs={10} sm={6} md={4} key={index}>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: false }}
                transition={{ duration: 0.4, delay: index * 0.2 }}
              >
                <Box display="flex" flexDirection="column" alignItems="center">
                  <Image
                    src={`/partners/${item.logoPath}`}
                    alt={item.name}
                    // sx={{
                    //   width: 80,
                    //   height: 80,
                    //   objectFit: "contain",
                    //   marginBottom: 8,
                    //   borderRadius: "1rem",
                  />
                  <Typography variant="subtitle1" fontWeight="medium">
                    {item.name}
                  </Typography>
                </Box>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box
        component="footer"
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "bgmain.main",
          borderTopLeftRadius: ".5rem",
          borderTopRightRadius: ".5rem",
          color: "white",
          opacity: showFooter ? 1 : 0,
          pointerEvents: showFooter ? "auto" : "none",
          transform: showFooter ? "translateY(0)" : "translateY(100%)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
          userSelect: "none",
          position: "fixed",
          bottom: 0,
          width: "100%",
          height: "30vh",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Box sx={{ fontSize: "24px", fontWeight: "bold", mb: 1 }}>
            UniJobLink
          </Box>
          <Box sx={{ fontSize: "16px", mb: 2 }}>
            {footert("connectMeaningfulInternships")}
          </Box>
        </Box>

        <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.2)", my: 1 }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 4,
              flexWrap: "wrap",
              fontSize: "14px",
            }}
          >
            <Box component="a" href={`/${locale}/AboutUs`} sx={linkStyle}>
              {footert("About")}
            </Box>
            <Box component="a" href={`/${locale}/Contact`} sx={linkStyle}>
              {footert("Contact")}
            </Box>
          </Box>

          <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
            <IconButton
              href="https://facebook.com/sannyeinphyo"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white" }}
            >
              <Facebook fontSize="small" />
            </IconButton>
            <IconButton
              href="https://linkedin.com/sannyeinphyo"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: "white" }}
            >
              <LinkedIn fontSize="small" />
            </IconButton>
            <IconButton
              href="mailto:sannyeinphyo@gmail.com"
              sx={{ color: "white" }}
            >
              <Email fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        <Box sx={{ fontSize: "13px", color: "gray.300", mt: 1 }}>
          © {new Date().getFullYear()} UniJobLink. All rights reserved.
        </Box>
      </Box>
    </Box>
  );
}
