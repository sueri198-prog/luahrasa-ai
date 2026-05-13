"use client";

import { useEffect, useRef, useState } from "react";

import { initializeApp } from "firebase/app";

import {
  getFirestore,
  doc,
  setDoc,
} from "firebase/firestore";

/* =========================
   FIREBASE CONFIG
========================= */

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   MAIN PAGE
========================= */

export default function Home() {
  const [nama, setNama] = useState("");
  const [kelas, setKelas] = useState("");

  const [selectedEmotion, setSelectedEmotion] =
    useState("");

  const [transcript, setTranscript] =
    useState("");

  const [summary, setSummary] =
    useState("");

  const [isListening, setIsListening] =
    useState(false);

  const recognitionRef = useRef<any>(null);

  const finalTranscriptRef = useRef("");

  /* =========================
     AI RINGKASAN
  ========================= */

  const generateSummary = (text: string) => {
    if (!text) return "";

    const ayat = text.split(".");

    const pendek = ayat
      .slice(0, 3)
      .join(". ");

    return `
Murid kelihatan mengalami emosi ${selectedEmotion}.

Isu utama yang diceritakan:
${pendek}

Murid menunjukkan tekanan emosi dan memerlukan perhatian serta sokongan daripada guru atau kaunselor.
    `;
  };

  /* =========================
     FIREBASE SAVE
  ========================= */

  const saveToFirebase = async () => {
    try {
      const documentId = `${nama}-${kelas}`;

      await setDoc(
        doc(db, "LuahanMurid", documentId),
        {
          nama,
          kelas,
          emosi: selectedEmotion,
          ceritaPenuh: transcript,
          ringkasanAI: summary,
          createdAt: new Date(),
        }
      );

      console.log("Berjaya simpan");
    } catch (error) {
      console.log(error);
    }
  };

  /* =========================
     SPEECH RECOGNITION
  ========================= */

  useEffect(() => {
    if (
      typeof window !== "undefined"
    ) {
      const SpeechRecognition =
        (window as any)
          .SpeechRecognition ||
        (window as any)
          .webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition =
          new SpeechRecognition();

        recognition.lang = "ms-MY";

        recognition.continuous = true;

        recognition.interimResults = true;

        recognition.onresult = (
          event: any
        ) => {
          let interim = "";

          for (
            let i = event.resultIndex;
            i < event.results.length;
            i++
          ) {
            const text =
              event.results[i][0]
                .transcript;

            if (
              event.results[i].isFinal
            ) {
              const current =
                finalTranscriptRef.current;

              if (
                !current.includes(
                  text
                )
              ) {
                finalTranscriptRef.current =
                  current + " " + text;
              }
            } else {
              interim += text;
            }
          }

          const fullText =
            (
              finalTranscriptRef.current +
              " " +
              interim
            ).trim();

          setTranscript(fullText);

          setSummary(
            generateSummary(
              fullText
            )
          );
        };

        recognition.onend = () => {
          if (isListening) {
            recognition.start();
          }
        };

        recognitionRef.current =
          recognition;
      }
    }
  }, [isListening]);

  /* =========================
     START
  ========================= */

  const startListening = () => {
    if (
      recognitionRef.current &&
      !isListening
    ) {
      try {
        recognitionRef.current.start();

        setIsListening(true);
      } catch (error) {
        console.log(error);
      }
    }
  };

  /* =========================
     STOP
  ========================= */

  const stopListening =
    async () => {
      if (
        recognitionRef.current
      ) {
        recognitionRef.current.stop();

        setIsListening(false);

        await saveToFirebase();
      }
    };

  /* =========================
     UI
  ========================= */

  return (
    <main className="min-h-screen bg-blue-50 p-10">

      <div className="max-w-6xl mx-auto bg-white rounded-3xl p-10 shadow-lg">

        {/* TITLE */}

        <div className="text-center mb-10">

          <h1 className="text-6xl font-bold text-blue-600">
            LuahRasa AI
          </h1>

          <p className="text-2xl mt-3 text-gray-600">
            Sistem Sokongan Emosi Murid
          </p>

        </div>

        {/* GRID */}

        <div className="grid md:grid-cols-2 gap-10">

          {/* LEFT */}

          <div>

            {/* NAMA */}

            <label className="text-3xl font-bold">
              Nama Murid
            </label>

            <input
              type="text"
              value={nama}
              onChange={(e) =>
                setNama(
                  e.target.value
                )
              }
              placeholder="Masukkan nama"
              className="w-full border-2 rounded-2xl p-5 text-2xl mt-3"
            />

            {/* KELAS */}

            <label className="text-3xl font-bold mt-8 block">
              Kelas
            </label>

            <input
              type="text"
              value={kelas}
              onChange={(e) =>
                setKelas(
                  e.target.value
                )
              }
              placeholder="Contoh: 5 Amanah"
              className="w-full border-2 rounded-2xl p-5 text-2xl mt-3"
            />

            {/* EMOSI */}

            <h2 className="text-5xl font-bold mt-10 mb-6">
              Apa Perasaan Anda Hari Ini?
            </h2>

            <div className="grid grid-cols-2 gap-5">

              {/* GEMBIRA */}

              <button
                onClick={() =>
                  setSelectedEmotion(
                    "Gembira"
                  )
                }
                className={`border-2 rounded-3xl p-8 text-3xl font-bold ${
                  selectedEmotion ===
                  "Gembira"
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                }`}
              >
                😊
                <br />
                Gembira
              </button>

              {/* SEDIH */}

              <button
                onClick={() =>
                  setSelectedEmotion(
                    "Sedih"
                  )
                }
                className={`border-2 rounded-3xl p-8 text-3xl font-bold ${
                  selectedEmotion ===
                  "Sedih"
                    ? "bg-blue-500 text-white"
                    : "bg-white"
                }`}
              >
                😢
                <br />
                Sedih
              </button>

            </div>

          </div>

          {/* RIGHT */}

          <div>

            <h2 className="text-5xl font-bold mb-5">
              Ceritakan Apa Yang Anda Rasa 🎤
            </h2>

            {/* BUTTONS */}

            <div className="flex gap-5">

              <button
                onClick={
                  startListening
                }
                className="bg-blue-500 text-white text-2xl px-8 py-4 rounded-2xl"
              >
                Mula Bercakap
              </button>

              <button
                onClick={
                  stopListening
                }
                className="bg-red-500 text-white text-2xl px-8 py-4 rounded-2xl"
              >
                Berhenti
              </button>

            </div>

            {/* STATUS */}

            {isListening && (
              <p className="text-red-500 text-2xl mt-4 font-bold">
                🔴 Sedang Mendengar...
              </p>
            )}

            {/* CERITA PENUH */}

            <div className="mt-6">

              <h3 className="text-3xl font-bold mb-3">
                Cerita Penuh Murid
              </h3>

              <textarea
                value={transcript}
                onChange={(e) => {
                  setTranscript(
                    e.target.value
                  );

                  finalTranscriptRef.current =
                    e.target.value;

                  setSummary(
                    generateSummary(
                      e.target.value
                    )
                  );
                }}
                className="w-full h-72 border-2 rounded-3xl p-5 text-2xl"
              />

            </div>

            {/* AI SUMMARY */}

            <div className="mt-8">

              <h3 className="text-3xl font-bold mb-3">
                Ringkasan AI Untuk Kaunselor 🤖
              </h3>

              <div className="bg-gray-100 rounded-3xl p-6 text-2xl whitespace-pre-line">

                {summary}

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}