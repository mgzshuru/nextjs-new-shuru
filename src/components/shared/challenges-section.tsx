"use client";

import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import type { StrapiChallengeCard } from "@/strapi/page";

interface ChallengesSectionProps {
  title: string;
  introText?: string;
  challenges: StrapiChallengeCard[];
}

export function ChallengesSection({ title, introText, challenges }: ChallengesSectionProps) {
  const t = useTranslations("shared.challengesSection");

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20 overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-20 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold tracking-tight text-foreground"
          >
            {title}
          </motion.h2>
          {introText && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground max-w-3xl mx-auto"
            >
              {introText}
            </motion.p>
          )}
        </div>

        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
          {challenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-card border rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="grid md:grid-cols-12 md:divide-x divide-border">
                {/* Left Side: Problem & Solution (Context) */}
                <div className="md:col-span-8 p-8 md:p-10 space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-destructive/10 text-destructive">
                        <AlertCircle className="w-4 h-4" />
                      </span>
                      <h4 className="font-semibold text-destructive uppercase tracking-widest text-xs">
                        {t("challengeLabel")}
                      </h4>
                    </div>
                    <p className="text-xl md:text-2xl font-medium leading-snug text-foreground">
                      "{challenge.pain}"
                    </p>
                  </div>

                  <div className="border-l-2 border-primary/30 pl-6 py-1">
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <h4 className="font-semibold text-primary uppercase tracking-widest text-xs">
                        {t("interventionLabel")}
                      </h4>
                    </div>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {challenge.intervention}
                    </p>
                  </div>
                </div>

                {/* Right Side: Result (Impact highlight) */}
                <div className="md:col-span-4 bg-muted/30 p-8 md:p-10 flex flex-col justify-center items-center text-center border-t md:border-t-0 border-border">
                  <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest text-xs mb-4">
                    {t("resultLabel")}
                  </h4>
                  <p className="text-2xl md:text-3xl font-bold text-foreground">
                    {challenge.result}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}