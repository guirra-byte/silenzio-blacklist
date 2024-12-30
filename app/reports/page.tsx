"use client";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animation-variants";
import { Report } from "../page";
import TextBlur from "@/components/ui/text-blur";
import Particles from "@/components/ui/particles";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const formattedDate = (date: Date) =>
  format(date, "dd/MM/yyyy HH:mm:ss", { locale: ptBR });

export default function Reports() {
  const [currentWhistleblower, setCurrentWhistleblower] = useState("");
  const isExecuted = useRef(false);
  const [content, setContent] = useState<
    Partial<{
      reason?: string;
      name: string;
      email: string;
      phoneNumber: string;
      at: string;
    }>[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      await fetch("/api/cache", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }).then(async (reply) => {
        if (isExecuted.current) return;
        const msg = (await reply.json()).message as string[];
        const payload = msg.map<{
          at: string;
          reason?: string;
          phoneNumber: string;
        }>((strObj) => {
          const data = JSON.parse(strObj);
          const at = formattedDate(data.at);
          return { ...data, at };
        });

        const whistleblowerLocalStorage = localStorage.getItem("whistleblower");
        if (whistleblowerLocalStorage) {
          setCurrentWhistleblower(whistleblowerLocalStorage);
        }

        setContent((prevContent) => [...prevContent, ...payload]);
        isExecuted.current = true;
      });
    };

    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-clip pt-12 md:pt-12">
      <motion.div variants={itemVariants}>
        <TextBlur
          className="text-center text-2xl font-medium tracking-tight text-zinc-200 md:text-3xl"
          text="Aqui está Nossa Blacklist"
        />
      </motion.div>

      {/* <button
        type="button"
        // onClick={() => setOpen(false)}
        className="m-2 inline-flex w-full justify-center gap-x-1.5 rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto">
        Exportar Blacklist .csv
      </button> */}

      <section className="flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          className="md:pt-16i flex h-full w-full flex-col gap-2 pb-12 pt-12 md:pb-24"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          <motion.div
            variants={itemVariants}
            className="mt-8 flex grid w-full grid-cols-2 items-center justify-center justify-between gap-2 gap-x-6 py-8 md:mt-4 md:grid-cols-4 md:gap-1">
            {content.map((report, index) => (
              <div
                key={index}
                className="h-15 flex items-center justify-center gap-x-6 rounded-lg border bg-zinc-900 p-2 py-5 transition-all duration-150 ease-in-out md:hover:border-zinc-700 md:hover:bg-accent">
                <div className="min-w-0 flex-auto">
                  <TextBlur
                    className="text-sm/6 font-semibold text-zinc-200"
                    text={`${report.phoneNumber}`}
                  />

                  <span className="inline-flex items-center rounded-md px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700">
                    {report.reason}
                  </span>
                </div>

                <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                  <p className="mt-1 text-xs/5 text-gray-500">{report.at}</p>
                  <div className="mt-1 flex items-center gap-x-1.5">
                    <div className="flex-none rounded-full bg-red-700/20 p-1">
                      <div className="size-1.5 rounded-full bg-red-700" />
                    </div>
                    <p className="text-xs/5 text-gray-500">Não Verificado</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <Particles
          quantityDesktop={350}
          quantityMobile={100}
          ease={80}
          color={"#F7FF9B"}
          refresh
        />
      </section>
    </main>
  );
}
