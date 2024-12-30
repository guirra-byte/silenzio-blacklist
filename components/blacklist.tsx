import { motion } from "framer-motion";
import { containerVariants, itemVariants } from "@/lib/animation-variants";
import TextBlur from "./ui/text-blur";
import Particles from "./ui/particles";
import { Report } from "@/app/page";

export default function Blacklist({ content }: { content: Report[] }) {
  return (
    <section className="flex flex-col items-center px-4 sm:px-6 lg:px-8">
      <motion.div
        className="md:pt-16i flex h-full w-full flex-col gap-2 pb-12 pt-12 md:pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible">
        <motion.div
          variants={itemVariants}
          className="mt-4 grid w-full grid-cols-2 items-center justify-center gap-2 md:mt-4 md:grid-cols-3 md:gap-1">
          {content.map((report, index) => (
            <div
              key={index}
              className="h-18 flex items-center justify-center rounded-lg border bg-zinc-900 p-2 transition-all duration-150 ease-in-out md:hover:border-zinc-700 md:hover:bg-accent">
              <TextBlur
                className="md:text-1xl text-center font-medium tracking-tight text-zinc-200"
                text={`${report.phoneNumber}`}
              />
            </div>
            // <Link
            //   key={index}
            //   href={logo.href}
            //   rel="noopener noreferrer"
            //   target="_blank"
            //   className="flex h-24 items-center justify-center rounded-lg border bg-zinc-900 p-8 transition-all duration-150 ease-in-out md:hover:border-zinc-700 md:hover:bg-accent">
            //   <Image
            //     src={logo.src}
            //     alt={logo.alt}
            //     width={100}
            //     height={100}
            //     className="h-auto w-32 opacity-85"
            //   />
            // </Link>
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
  );
}
