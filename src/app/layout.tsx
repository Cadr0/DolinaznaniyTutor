import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Долина знаний — платформа для репетиторов",
  description:
    "Комнаты для учеников, задания, домашняя работа и маркетплейс материалов",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
