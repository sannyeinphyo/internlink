"use client";

import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import Image from "next/image";

const team = [
  {
    name: "San Nyein Phyo",
    role: "Student & Company Side Developer",
    image: "/profile/litch.png",
    bio: "Leads the architecture and full-stack development of InternLink.",
    email: "litch@internlink.com",
    linkedin: "https://linkedin.com/in/sannyeinphyo",
  },
  {
    name: "Kaung Myat Khine",
    role: "Admin Side Developer",
    image: "/profile/kaung.png",
    bio: "Handles API development and database integration.",
    email: "aung@internlink.com",
    linkedin: "https://linkedin.com/in/aungaung",
  },
];

export default function AboutUs() {
  const t = useTranslations("about_us");

  return (
    <Box>
      <Box sx={{ py: 8, px: 2, maxWidth: 1280, mx: "auto" }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            {t("heading")}
          </Typography>

          <Typography variant="body1" mb={3}>
            {t("heading_description")}
          </Typography>

          <Typography variant="body1" mb={3}>
            {t("heaing_description2")}
          </Typography>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <Paper elevation={3} sx={{ p: 3, mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              🚀 {t("mission")}
            </Typography>
            <Typography variant="body2" mb={2}>
              {t("mission_description")}
            </Typography>

            <Typography variant="h6" gutterBottom>
              🌍 {t("vision")}
            </Typography>
            <Typography variant="body2" mb={2}>
              {t("vision_description")}
            </Typography>

            <Typography variant="h6" gutterBottom>
              ✅ {t("why_internLink")}
            </Typography>
            <ul style={{ paddingLeft: 20 , marginTop: 10 }}>
              <li style={{margin:" 8px 0"}}>{t("why_internlink_description.text1")}</li>
              <li style={{margin:" 8px 0"}}>{t("why_internlink_description.text2")}</li>
              <li style={{margin:" 8px 0"}}>{t("why_internlink_description.text3")}</li>
              <li style={{margin:" 8px 0"}}>{t("why_internlink_description.text4")}</li>
              <li style={{margin:" 8px 0"}}>{t("why_internlink_description.text5")}</li>
              <li style={{margin:" 8px 0"}}>{t("why_internlink_description.text6")}</li>
            </ul>
          </Paper>
        </motion.div>

        {/* Team Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <Typography variant="h5" fontWeight="bold" mt={6} mb={3}>
            👥 {t("our_team")}
          </Typography>

          <Grid container spacing={4} justifyContent="center" display={"flex"}>
            {team.map((member, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    elevation={3}
                    sx={{
                      textAlign: "center",
                      overflow: "hidden",
                      position: "relative",
                      py: 3,
                      transition: "all 0.3s ease",
                      "&:hover .hoverContent": {
                        maxHeight: 200,
                        opacity: 1,
                      },
                    }}
                  >
                    <Avatar
                      src={member.image}
                      alt={member.name}
                      sx={{
                        width: 90,
                        height: 90,
                        mx: "auto",
                        mb: 2,
                        border: "2px solid #1976d2",
                      }}
                    />
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {member.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" mb={1}>
                        {member.role}
                      </Typography>

                      <Box
                        className="hoverContent"
                        sx={{
                          maxHeight: 0,
                          overflow: "hidden",
                          opacity: 0,
                          transition: "all 0.4s ease",
                        }}
                      >
                        <Typography variant="body2" color="textSecondary">
                          {member.bio}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </motion.div>
      </Box>
    </Box>
  );
}
