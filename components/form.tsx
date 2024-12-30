import Link from "next/link";
import { ChangeEvent, ChangeEventHandler, HTMLInputTypeAttribute } from "react";
import { motion } from "framer-motion";
import { FaGithub, FaXTwitter } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { FaArrowRightLong } from "react-icons/fa6";
import { EnhancedButton } from "@/components/ui/enhanced-btn";
import { containerVariants, itemVariants } from "@/lib/animation-variants";

interface FormProps {
  name?: string;
  email?: string;
  phoneNumber?: string;
  reason?: string;
  handleReport: (e: ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: () => void;
  handleBlacklist: () => void;
  loading: boolean;
}

export default function Form({
  name,
  email,
  reason,
  phoneNumber,
  handleReport,
  handleSubmit,
  loading,
  handleBlacklist
}: FormProps) {
  return (
    <motion.div
      className="mt-6 flex w-full max-w-[24rem] flex-col gap-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible">
      <motion.div variants={itemVariants}>
        <Input
          type="text"
          placeholder="Seu Nome"
          required={true}
          value={name}
          name="name"
          onChange={handleReport}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Input
          type="email"
          placeholder="Seu Email"
          name="email"
          required={true}
          value={email}
          onChange={handleReport}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Input
          type="tel"
          name="phoneNumber"
          required={true}
          placeholder="Número de Telefone para Reportar"
          value={phoneNumber}
          onChange={handleReport}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <Input
          type="text"
          name="reason"
          placeholder="Possível Motivo da Ligação Indesejada"
          required={false}
          value={reason}
          maxLength={25}
          onChange={handleReport}
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <EnhancedButton
          variant="expandIcon"
          Icon={FaArrowRightLong}
          onClick={handleSubmit}
          iconPlacement="right"
          className="mt-2 w-full"
          disabled={loading}>
          {loading ? "Loading..." : "Contribuir com a Blacklist"}
        </EnhancedButton>
      </motion.div>

      <motion.div variants={itemVariants}>
        <EnhancedButton
          variant="expandIcon"
          Icon={FaArrowRightLong}
          onClick={handleBlacklist}
          iconPlacement="right"
          className="mt-2 w-full"
          disabled={loading}>
          {"Acessar a Blacklist"}
        </EnhancedButton>
      </motion.div>
    </motion.div>
  );
}
