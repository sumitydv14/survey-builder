"use client";

import { useEffect, useState } from "react";
import DashboardHeader from '../components/ui/DashboardHeader';
import SurveyCard from "../components/ui/SurveyCard";
import { createSurvey, getSurveys } from "../services/surveyApi";
import { motion } from "framer-motion";
import ImportSchemaModal from "../components/ui/ImportSchemaModal";
import { useRouter } from "next/navigation";

interface Survey {
  _id: string;
  title: string;
  description: string;
  product: string;
}

export default function Dashboard() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [product, setProduct] = useState("");
  const [openImport, setOpenImport] = useState(false);
  const router = useRouter();

  const loadSurveys = async () => {
    const data = await getSurveys();
    setSurveys(data.surveys || []);
  };

  useEffect(() => {
    loadSurveys();
  }, []);

  const handleCreate = async () => {
    await createSurvey({ title, description, product });
    loadSurveys();
  };

  return (
    <>
    <main className="p-8 max-w-5xl mx-auto">
      <DashboardHeader />
      <motion.div
        className="bg-white p-4 rounded-lg border mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="font-semibold mb-3">
          Create New Survey
        </h2>

        <div className="grid grid-cols-3 gap-3">
          <input
            placeholder="Title"
            className="border p-2 rounded"
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            placeholder="Description"
            className="border p-2 rounded"
            onChange={(e) => setDescription(e.target.value)}
          />

          <input
            placeholder="Product"
            className="border p-2 rounded"
            onChange={(e) => setProduct(e.target.value)}
          />
        </div>

        <button
          onClick={() => setOpenImport(true)}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Import Schema
        </button>

        <button
          onClick={handleCreate}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
        >
          Create Survey
        </button>
      </motion.div>
      <div className="grid grid-cols-3 gap-4">
        {surveys.map((s) => (
          <SurveyCard
            key={s._id}
            title={s.title}
            product={s.product}
          />
        ))}
      </div>
    </main>
    <ImportSchemaModal
      isOpen={openImport}
      onClose={() => setOpenImport(false)}
      onUpload={async (fileText) => {
        const res = await fetch("/api/surveys", {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            product,
            rawCode: fileText,
          }),
        });

        const data = await res.json();

        router.push(`/surveys/${data.survey._id}/editor`);
      }}
      />
    </>
  );
}