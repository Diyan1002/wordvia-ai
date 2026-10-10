"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import {
  FileText,
  Copy,
  Check,
  Trash2,
  ArrowLeft,
  Sparkles,
  Search,
} from "lucide-react";

type DocumentItem = {
  id: string;
  title: string;
  originalText: string;
  humanizedText: string;
  tone?: string;
  level?: string;
  language?: string;
  createdAt: string;
};

export default function HistoryPage() {

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);


  useEffect(() => {

    loadHistory();

  }, []);


  function loadHistory() {

    try {

      const saved = localStorage.getItem(
        "wordvia_history"
      );

      if (!saved) {

        setDocuments([]);

        return;

      }


      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {

        setDocuments(parsed);

      } else {

        setDocuments([]);

      }

    } catch (error) {

      console.error(
        "History loading error:",
        error
      );

      setDocuments([]);

    }

  }



  async function copyText(
    document: DocumentItem
  ) {

    try {

      await navigator.clipboard.writeText(
        document.humanizedText
      );

      setCopiedId(document.id);

      setTimeout(() => {

        setCopiedId(null);

      }, 2000);

    } catch (error) {

      console.error(
        "Copy error:",
        error
      );

    }

  }



  function deleteDocument(id: string) {

    const confirmed = window.confirm(
      "Delete this document?"
    );

    if (!confirmed) {
      return;
    }


    const updated = documents.filter(
      (document) =>
        document.id !== id
    );


    setDocuments(updated);


    localStorage.setItem(
      "wordvia_history",
      JSON.stringify(updated)
    );


    /*
      Update document counter
    */

    localStorage.setItem(
      "wordvia_documents",
      String(updated.length)
    );

  }



  function clearHistory() {

    if (documents.length === 0) {
      return;
    }


    const confirmed = window.confirm(
      "Are you sure you want to delete all history?"
    );


    if (!confirmed) {
      return;
    }


    setDocuments([]);

    localStorage.removeItem(
      "wordvia_history"
    );

    localStorage.setItem(
      "wordvia_documents",
      "0"
    );

  }



  const filteredDocuments =
    documents.filter((document) => {

      const query =
        search
          .trim()
          .toLowerCase();


      if (!query) {
        return true;
      }


      return (
        document.title
          ?.toLowerCase()
          .includes(query) ||

        document.originalText
          ?.toLowerCase()
          .includes(query) ||

        document.humanizedText
          ?.toLowerCase()
          .includes(query)
      );

    });



  return (

    <div
      className="
        min-h-screen
        bg-[#fafafa]
      "
    >


      {/* HEADER */}

      <header
        className="
          sticky
          top-0
          z-20
          border-b
          border-gray-200
          bg-white/90
          backdrop-blur-md
        "
      >

        <div
          className="
            mx-auto
            flex
            h-20
            max-w-7xl
            items-center
            justify-between
            px-5
            sm:px-8
          "
        >


          <Link
            href="/dashboard"
            className="
              inline-flex
              items-center
              gap-2
              text-sm
              font-semibold
              text-gray-700
              hover:text-purple-600
            "
          >

            <ArrowLeft size={18} />

            Dashboard

          </Link>



          <div
            className="
              flex
              items-center
              gap-2
              font-semibold
              text-gray-900
            "
          >

            <Sparkles
              size={20}
              className="text-purple-600"
            />

            Wordvia.ai

          </div>


        </div>

      </header>



      {/* MAIN */}

      <main
        className="
          mx-auto
          max-w-7xl
          px-5
          py-10
          sm:px-8
          lg:px-10
        "
      >


        {/* TITLE */}

        <div
          className="
            flex
            flex-col
            justify-between
            gap-5
            md:flex-row
            md:items-end
          "
        >

          <div>

            <div
              className="
                mb-3
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-purple-50
                px-3
                py-1.5
                text-xs
                font-semibold
                text-purple-600
              "
            >

              <FileText size={14} />

              Writing History

            </div>


            <h1
              className="
                text-3xl
                font-bold
                tracking-tight
                text-gray-900
                sm:text-4xl
              "
            >

              Your Documents

            </h1>


            <p
              className="
                mt-2
                text-sm
                text-gray-500
                sm:text-base
              "
            >

              View and manage your
              humanized writing.

            </p>

          </div>



          {documents.length > 0 && (

            <button
              type="button"
              onClick={clearHistory}
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                rounded-xl
                border
                border-red-200
                bg-white
                px-4
                py-3
                text-sm
                font-semibold
                text-red-600
                hover:bg-red-50
              "
            >

              <Trash2 size={17} />

              Clear History

            </button>

          )}

        </div>



        {/* SEARCH */}

        {documents.length > 0 && (

          <div className="mt-8">

            <div
              className="
                relative
                max-w-xl
              "
            >

              <Search
                size={18}
                className="
                  absolute
                  left-4
                  top-1/2
                  -translate-y-1/2
                  text-gray-400
                "
              />


              <input
                type="text"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search your documents..."
                className="
                  w-full
                  rounded-xl
                  border
                  border-gray-200
                  bg-white
                  py-3.5
                  pl-11
                  pr-4
                  text-sm
                  outline-none
                  transition
                  focus:border-purple-400
                  focus:ring-2
                  focus:ring-purple-100
                "
              />

            </div>

          </div>

        )}



        {/* DOCUMENTS */}

        <section className="mt-8">


          {filteredDocuments.length === 0 ? (

            <div
              className="
                rounded-3xl
                border
                border-gray-200
                bg-white
                px-6
                py-16
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-2xl
                  bg-purple-50
                  text-purple-600
                "
              >

                <FileText size={27} />

              </div>


              <h2
                className="
                  mt-5
                  text-xl
                  font-bold
                  text-gray-900
                "
              >

                {search
                  ? "No documents found"
                  : "No documents yet"}

              </h2>


              <p
                className="
                  mx-auto
                  mt-2
                  max-w-md
                  text-sm
                  leading-6
                  text-gray-500
                "
              >

                {search
                  ? "Try a different search term."
                  : "Your humanized documents will appear here after you use the AI Humanizer."}

              </p>


              {!search && (

                <Link
                  href="/humanizer"
                  className="
                    mt-6
                    inline-flex
                    items-center
                    gap-2
                    rounded-xl
                    bg-purple-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-purple-700
                  "
                >

                  <Sparkles size={17} />

                  Start Humanizing

                </Link>

              )}

            </div>

          ) : (

            <div className="space-y-5">

              {filteredDocuments.map(
                (document) => {

                  const wordCount =
                    document.originalText
                      ?.trim()
                      ?.split(/\s+/)
                      ?.length || 0;


                  return (

                    <article
                      key={document.id}
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                        shadow-sm
                      "
                    >


                      {/* DOCUMENT HEADER */}

                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          border-b
                          border-gray-100
                          px-6
                          py-5
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >

                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                          "
                        >

                          <div
                            className="
                              flex
                              h-11
                              w-11
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              bg-purple-50
                              text-purple-600
                            "
                          >

                            <FileText size={19} />

                          </div>


                          <div className="min-w-0">

                            <h2
                              className="
                                truncate
                                text-sm
                                font-semibold
                                text-gray-900
                              "
                            >

                              {document.title ||
                                "Humanized Document"}

                            </h2>


                            <p
                              className="
                                mt-1
                                text-xs
                                text-gray-500
                              "
                            >

                              {wordCount.toLocaleString()}
                              {" "}words

                              {" • "}

                              {document.tone ||
                                "Professional"}

                              {" • "}

                              {document.language ||
                                "English"}

                            </p>

                          </div>

                        </div>



                        {/* ACTIONS */}

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <button
                            type="button"
                            onClick={() =>
                              copyText(document)
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-lg
                              border
                              border-gray-200
                              px-3
                              py-2
                              text-xs
                              font-semibold
                              text-gray-700
                              hover:bg-gray-50
                            "
                          >

                            {copiedId ===
                            document.id ? (

                              <>
                                <Check
                                  size={15}
                                />

                                Copied

                              </>

                            ) : (

                              <>
                                <Copy
                                  size={15}
                                />

                                Copy

                              </>

                            )}

                          </button>



                          <button
                            type="button"
                            onClick={() =>
                              deleteDocument(
                                document.id
                              )
                            }
                            className="
                              rounded-lg
                              border
                              border-red-100
                              p-2
                              text-red-500
                              hover:bg-red-50
                            "
                            title="Delete"
                          >

                            <Trash2
                              size={16}
                            />

                          </button>

                        </div>

                      </div>



                      {/* TEXT */}

                      <div className="grid md:grid-cols-2">


                        {/* ORIGINAL */}

                        <div
                          className="
                            border-b
                            border-gray-100
                            p-6
                            md:border-b-0
                            md:border-r
                          "
                        >

                          <p
                            className="
                              mb-3
                              text-xs
                              font-semibold
                              uppercase
                              tracking-wider
                              text-gray-400
                            "
                          >

                            Original

                          </p>


                          <p
                            className="
                              max-h-64
                              overflow-auto
                              whitespace-pre-wrap
                              text-sm
                              leading-6
                              text-gray-600
                            "
                          >

                            {document.originalText}

                          </p>

                        </div>



                        {/* HUMANIZED */}

                        <div className="p-6">

                          <p
                            className="
                              mb-3
                              text-xs
                              font-semibold
                              uppercase
                              tracking-wider
                              text-purple-500
                            "
                          >

                            Humanized

                          </p>


                          <p
                            className="
                              max-h-64
                              overflow-auto
                              whitespace-pre-wrap
                              text-sm
                              leading-6
                              text-gray-700
                            "
                          >

                            {document.humanizedText}

                          </p>

                        </div>


                      </div>


                    </article>

                  );

                }
              )}

            </div>

          )}

        </section>


        {/* FOOTER */}

        <footer
          className="
            py-10
            text-center
            text-xs
            text-gray-400
          "
        >

          © 2026 Wordvia.ai. All rights reserved.

        </footer>


      </main>

    </div>

  );
}