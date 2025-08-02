"use client";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";

export default function App() {
    const {locale} = useParams();
    const router = useRouter();
    router.push(`/${locale}/dashboard`);
}