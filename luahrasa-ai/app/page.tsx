"use client";

import { useEffect, useRef, useState } from "react";

import { db } from "../firebase";

import {
  doc,
  setDoc,
} from "firebase/firestore";

export default function Home() {
  const [emotion, setEmotion] = useState("");
  const [name, setName] = useState("");
  const [kelas, setKelas] = useState("");

  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");

  const [isListening, setIsListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  const emotions = [
    { emoji: "😊", label: "Gembira" },
    { emoji: "😢", label: "Sedih" },
    { emoji: "😡", label: "Marah" },
    { emoji: "😨", label: "Takut" },
    { emoji: "😞", label: "Kecewa" },
    { emoji: "😌", label: "Tenang" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();

        recognition.lang = "ms-MY";
        recognition.continuous = true;
        recognition.interimResults = true;

        let lastProcessed = "";

        recognition.onresult = (event: any) => {
          let latestTranscript = "";

          for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
          ) {
            const text = event.results[i][0].transcript;

            if (event.results[i].isFinal) {
              latestTranscript += text + " ";
            }
          }

          latestTranscript = latestTranscript.trim();

          if (
            latestTranscript &&
            latestTranscript !== lastProcessed
          ) {
            lastProcessed = latestTranscript;

            setTranscript((current) => {
              return (
                current + " " + latestTranscript
              ).trim();
            });
          }
        };

        recognition.onend = () => {
          if (isListening) {
            try {
              recognition.start();
            } catch (err) {}
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [isListening]);

  const startListening = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.log(err);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;

    recognitionRef.current.stop();

    setIsListening(false);
  };

  const generateSummary = async () => {
    if (!transcript) return;

    let aiAnalysis = "";

    if (emotion === "Sedih") {
      aiAnalysis =
        "Murid menunjukkan tanda kesedihan dan tekanan emosi yang mungkin berkaitan dengan pengalaman negatif atau masalah peribadi.";
    } else if (emotion === "Marah") {
      aiAnalysis =
        "Murid menunjukkan emosi kemarahan dan kemungkinan sedang menghadapi konflik atau tekanan tertentu.";
    } else if (emotion === "Takut") {
      aiAnalysis =
        "Murid menunjukkan tanda kebimbangan dan ketakutan terhadap situasi tertentu serta memerlukan ruang sokongan yang selamat.";
    } else if (emotion === "Kecewa") {
      aiAnalysis =
        "Murid kelihatan kecewa terhadap sesuatu situasi dan mungkin memerlukan motivasi serta perhatian emosi.";
    } else if (emotion === "Gembira") {
      aiAnalysis =
        "Murid berada dalam keadaan emosi yang positif dan stabil berdasarkan perkongsian yang diberikan.";
    } else if (emotion === "Tenang") {
      aiAnalysis =
        "Murid berada dalam keadaan yang lebih tenang dan terkawal dari segi emosi.";
    } else {
      aiAnalysis =
        "Murid memerlukan perhatian dan sokongan emosi daripada pihak kaunselor.";
    }

    const finalSummary = `
Ringkasan AI:
Murid bernama ${name || "Tidak dinyatakan"} 
dari kelas ${kelas || "Tidak dinyatakan"} 
menunjukkan emosi "${emotion || "Tidak dipilih"}".

Hasil analisis AI mendapati bahawa:
${aiAnalysis}

Kaunselor disarankan membuat semakan lanjut bagi memahami keadaan murid dengan lebih mendalam.
`;

    setSummary(finalSummary);

    try {

      // DOCUMENT ID = NAMA + KELAS
      const documentId = `${name || "tanpa_nama"}_${kelas || "tanpa_kelas"}`
        .replace(/\s+/g, "_");

      await setDoc(
        doc(db, "luahanMurid", documentId),
        {
          nama: name,
          kelas: kelas,
          emosi: emotion,
          ceritaPenuh: transcript,
          ringkasanAI: finalSummary,
          createdAt: new Date(),
        }
      );

      alert(
        "Cerita berjaya dihantar kepada kaunselor ❤️"
      );

    } catch (error) {
      console.error(error);

      alert("Ralat menyimpan data");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <div className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl p-8">

        {/* TITLE */}
        <h1 className="text-6xl font-bold text-center text-blue-600">
          LuahRasa AI
        </h1>

        <p className="text-center text-gray-600 mt-3 text-xl">
          Sistem Sokongan Emosi Murid
        </p>

        <div className="grid md:grid-cols-2 gap-10 mt-10">

          {/* LEFT */}
          <div>

            {/* NAMA */}
            <div className="mb-5">
              <label className="font-bold text-2xl">
                Nama Murid
              </label>

              <input
                type="text"
                placeholder="Masukkan nama"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
                className="w-full border rounded-2xl p-4 mt-2 text-xl"
              />
            </div>

            {/* KELAS */}
            <div className="mb-8">
              <label className="font-bold text-2xl">
                Kelas
              </label>

              <input
                type="text"
                placeholder="Contoh: 5 Amanah"
                value={kelas}
                onChange={(e) =>
                  setKelas(e.target.value)
                }
                className="w-full border rounded-2xl p-4 mt-2 text-xl"
              />
            </div>

            {/* EMOSI */}
            <h2 className="text-5xl font-bold mb-6">
              Apa Perasaan Anda Hari Ini?
            </h2>

            <div className="grid grid-cols-2 gap-5">

              {emotions.map((item) => (
                <button
                  key={item.label}
                  onClick={() =>
                    setEmotion(item.label)
                  }
                  className={`border rounded-3xl p-8 text-center transition-all ${
                    emotion === item.label
                      ? "bg-blue-500 text-white"
                      : "bg-white"
                  }`}
                >
                  <div className="text-6xl mb-3">
                    {item.emoji}
                  </div>

                  <div className="text-3xl font-bold">
                    {item.label}
                  </div>

                </button>
              ))}

            </div>

          </div>

          {/* RIGHT */}
          <div>

            <h2 className="text-5xl font-bold mb-6">
              Ceritakan Apa Yang Anda Rasa 🎤
            </h2>

            {/* BUTTON */}
            <div className="flex gap-4 mb-4">

              <button
                onClick={startListening}
                className="bg-blue-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold"
              >
                Mula Bercakap
              </button>

              <button
                onClick={stopListening}
                className="bg-red-500 text-white px-8 py-4 rounded-2xl text-2xl font-bold"
              >
                Berhenti
              </button>

            </div>

            {/* STATUS */}
            {isListening && (
              <p className="text-red-500 font-bold text-2xl mb-3 animate-pulse">
                🔴 Sedang Mendengar...
              </p>
            )}

            {/* TEXTAREA */}
            <textarea
              value={transcript}
              onChange={(e) =>
                setTranscript(e.target.value)
              }
              className="w-full h-80 border rounded-3xl p-5 text-2xl"
              placeholder="Cerita anda akan muncul di sini..."
            />

            {/* BUTTON GENERATE */}
            <button
              onClick={generateSummary}
              className="bg-green-600 text-white px-8 py-4 rounded-2xl text-2xl font-bold mt-6"
            >
              Generate Ringkasan AI
            </button>

            {/* CERITA PENUH */}
            {transcript && (
              <div className="mt-8">

                <h3 className="text-4xl font-bold mb-4">
                  Cerita Penuh Murid 📝
                </h3>

                <div className="bg-white rounded-3xl p-6 border">

                  <p className="text-2xl whitespace-pre-line">
                    {transcript}
                  </p>

                </div>

              </div>
            )}

            {/* RINGKASAN AI */}
            {summary && (
              <div className="mt-8">

                <h3 className="text-4xl font-bold mb-4">
                  Ringkasan AI Untuk Kaunselor 🤖
                </h3>

                <div className="bg-slate-100 rounded-3xl p-6 border">

                  <p className="text-2xl whitespace-pre-line">
                    {summary}
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}