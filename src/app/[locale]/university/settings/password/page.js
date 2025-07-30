"use client"
import { redirect } from "next/navigation"
import { useParams } from "next/navigation"
export default function App() {
    const {locale} = useParams();
    return redirect(`/${locale}/reset_password`);

}