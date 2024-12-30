"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CTA from "@/components/cta";
import Form from "@/components/form";
import Particles from "@/components/ui/particles";
import { dumpCacheToCsv } from "@/utils/dump-cache-to-csv";

export interface Report {
  reason?: string;
  phoneNumber: string;
  name: string;
  email: string;
}

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<Partial<Report>>({});
  const router = useRouter();
  const handleReport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setReport((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  const isValidPhoneNumber = (phoneNumber: string) => {
    const phoneNumberRegex = new RegExp(/^\(?\d{2}\)?\s?(?:9?\d{4})-?\d{4}$/);
    return phoneNumberRegex.test(phoneNumber);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleBlacklist = async () => {
    router.replace("http://localhost:3000/reports");
  };

  const handleSubmit = async () => {
    if (report) {
      const { phoneNumber, name, email, reason } = report;
      if (!phoneNumber || !name || !email) {
        toast.error("Preencha Todos os Campos 😠");
        return;
      }

      if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        toast.error("Informe um Número de Telefone Válido 😠");
        return;
      }

      if (!isValidEmail(email)) {
        toast.error("Informe um Email Válido 😠");
        return;
      }

      setLoading(true);
      const saveToLocalStorage = (email: string) => {
        localStorage.setItem("whistleblower", email);
      };
      const promise = new Promise(async (resolve, reject) => {
        try {
          const currentReport = {
            phoneNumber,
            whistleblower: { name, email },
            reason,
          };

          await fetch("/api/cache", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(report),
          }).then(async (cacheResponse) => {
            if (!cacheResponse.ok) {
              reject("Não foi possível reportar.");
            } else {
              resolve(currentReport);
              saveToLocalStorage(currentReport.whistleblower.email);
              router.replace("http://localhost:3000/reports");
              // await dumpCacheToCsv();
            }
          });
        } catch (error) {
          reject(error);
        }
      });

      toast.promise(promise, {
        loading: "Adicionando número à nossa Blacklist... 🚀",
        success: () => {
          setReport({});
          return "Obrigado por sua contribuição. Queremos ver você por aqui novamente! 🎉";
        },
        error: (error) => {
          if (error === "Rate limited") {
            return "You're doing that too much. Please try again later";
          } else if (error === "Notion insertion failed") {
            return "Failed to save your details. Please try again 😢.";
          }
          return "An error occurred. Please try again 😢.";
        },
      });

      promise.finally(() => {
        setLoading(false);
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-clip pt-12 md:pt-24">
      <section className="flex flex-col items-center px-4 sm:px-6 lg:px-8">
        <CTA />
        <Form
          handleBlacklist={handleBlacklist}
          name={report?.name}
          email={report?.email}
          phoneNumber={report.phoneNumber}
          reason={report.reason}
          handleReport={handleReport}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      </section>
      <Particles
        quantityDesktop={350}
        quantityMobile={100}
        ease={80}
        color={"#F7FF9B"}
        refresh
      />
    </main>
  );
}
