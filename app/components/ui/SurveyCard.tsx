"use client";

interface Props {
  title: string;
  product: string;
}

export default function SurveyCard({ title, product }: Props) {
  return (
    <div className="p-4 border rounded-lg shadow-sm hover:shadow-md transition">
      <h2 className="font-semibold">{title}</h2>
      <p className="text-sm text-gray-500">
        Product: {product}
      </p>
    </div>
  );
}