"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail, User, Loader2, CheckCircle2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export function SubscribeForm() {
  const t = useTranslations("subscribe");
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const formSchema = z.object({
    fullName: z.string().min(2, { message: t("validation.minLength", { min: 2 }) }),
    email: z.string().email({ message: t("validation.invalidEmail") }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
    },
  });

  const submitToListmonk = async (email: string, name: string) => {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("name", name);
    formData.append("l", "0cf26f9c-5527-4c4d-b2de-99c85ecaf706"); // Shuru list ID

    const response = await fetch("https://newsletter.shuru.sa/subscription/form", {
      method: "POST",
      body: formData,
      mode: "no-cors", // Required for cross-origin requests to external domains
    });

    // Note: With no-cors mode, we can't read the response, so we assume success if no error is thrown
    return response;
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        await submitToListmonk(values.email, values.fullName);
        setIsSuccess(true);
        toast.success(t("form.success"));
        form.reset();
      } catch (error) {
        toast.error(t("form.error"));
      }
    });
  }

  return (
    <div className="relative overflow-hidden w-full">
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold tracking-wide text-foreground/80">
                        {t("form.fullName")}
                      </FormLabel>
                      <div className="relative group">
                        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                          <User className="h-4 w-4" />
                        </span>
                        <FormControl>
                          <Input
                            placeholder={t("form.fullName").replace(" *", "")}
                            {...field}
                            disabled={isPending}
                            className="ps-9 h-11 border-border bg-background/50 backdrop-blur-xs focus-visible:border-primary/80 focus-visible:ring-primary/20 hover:border-border/80 transition-all duration-300 rounded-xl"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-xs font-medium mt-1" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="space-y-1.5">
                      <FormLabel className="text-sm font-semibold tracking-wide text-foreground/80">
                        {t("form.email")}
                      </FormLabel>
                      <div className="relative group">
                        <span className="absolute inset-y-0 start-0 flex items-center ps-3 text-muted-foreground group-focus-within:text-primary transition-colors duration-200">
                          <Mail className="h-4 w-4" />
                        </span>
                        <FormControl>
                          <Input
                            placeholder={t("form.email").replace(" *", "")}
                            type="email"
                            {...field}
                            disabled={isPending}
                            className="ps-9 h-11 border-border bg-background/50 backdrop-blur-xs focus-visible:border-primary/80 focus-visible:ring-primary/20 hover:border-border/80 transition-all duration-300 rounded-xl"
                          />
                        </FormControl>
                      </div>
                      <FormMessage className="text-xs font-medium mt-1" />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 rounded-xl font-semibold text-base transition-all duration-300 bg-primary hover:bg-primary/95 text-primary-foreground shadow-md hover:shadow-lg flex items-center justify-center gap-2 group/btn"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>{t("form.submitting")}</span>
                    </>
                  ) : (
                    <>
                      <span>{t("form.submit")}</span>
                      <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 rtl:group-hover/btn:-translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center py-8 px-4"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 15 }}
              className="bg-primary/10 p-4 rounded-full mb-6 border border-primary/20"
            >
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </motion.div>
            <motion.h3
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold tracking-tight text-foreground mb-3"
            >
              {t("form.success")}
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-muted-foreground text-sm max-w-sm"
            >
              {t("description")}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8"
            >
              <Button
                variant="outline"
                onClick={() => setIsSuccess(false)}
                className="rounded-xl px-6 py-2 border-border/80 hover:bg-accent/50 text-sm font-medium transition-all"
              >
                {t("form.submit")}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
