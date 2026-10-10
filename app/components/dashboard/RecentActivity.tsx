"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  ArrowRight,
  Clock,
} from "lucide-react";
import Link from "next/link";

type Activity = {
  id: string;
  title: string;
  description: string;
  time: string;
  words: number;
};

export default function RecentActivity() {

  const [activities, setActivities] = useState<Activity[]>([]);


  useEffect(() => {

    try {

      const saved = localStorage.getItem(
        "wordvia_history"
      );

      if (!saved) {
        setActivities([]);
        return;
      }


      const history = JSON.parse(saved);


      const recent = history
        .slice(0, 5)
        .map((item: any) => {

          const words =
            item.originalText
              ?.trim()
              ?.split(/\s+/)
              ?.length || 0;


          return {
            id: item.id,
            title:
              item.title ||
              "Humanized Document",
            description:
              `${words.toLocaleString()} words • ${item.tone || "Professional"}`,
            time:
              item.createdAt || "",
            words,
          };

        });


      setActivities(recent);

    } catch (error) {

      console.error(
        "Recent activity error:",
        error
      );

      setActivities([]);

    }

  }, []);



  return (

    <div
      className="
        rounded-2xl
        border
        border-gray-200
        bg-white
      "
    >


      {/* HEADER */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-gray-100
          px-6
          py-5
        "
      >

        <div>

          <h2 className="font-semibold text-gray-900">
            Recent Activity
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Your latest writing activity
          </p>

        </div>


        <Link
          href="/history"
          className="
            flex
            items-center
            gap-1
            text-sm
            font-medium
            text-purple-600
            hover:text-purple-700
          "
        >

          View all

          <ArrowRight size={15} />

        </Link>

      </div>



      {/* CONTENT */}

      <div className="p-6">


        {activities.length === 0 ? (

          <div
            className="
              flex
              flex-col
              items-center
              justify-center
              rounded-xl
              border
              border-dashed
              border-gray-200
              px-6
              py-10
              text-center
            "
          >

            <div
              className="
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-gray-50
                text-gray-400
              "
            >

              <FileText size={20} />

            </div>


            <h3
              className="
                mt-4
                text-sm
                font-semibold
                text-gray-800
              "
            >
              No recent documents
            </h3>


            <p
              className="
                mt-1
                max-w-sm
                text-sm
                text-gray-500
              "
            >
              Your humanized documents will
              appear here.
            </p>


            <Link
              href="/humanizer"
              className="
                mt-5
                rounded-lg
                bg-purple-600
                px-4
                py-2
                text-sm
                font-semibold
                text-white
                hover:bg-purple-700
              "
            >
              Humanize your first text
            </Link>

          </div>

        ) : (

          <div className="space-y-3">

            {activities.map((activity) => (

              <div
                key={activity.id}
                className="
                  flex
                  items-center
                  gap-4
                  rounded-xl
                  border
                  border-gray-100
                  p-4
                  transition
                  hover:border-purple-100
                  hover:bg-purple-50/30
                "
              >


                {/* ICON */}

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



                {/* INFO */}

                <div className="min-w-0 flex-1">

                  <h3
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-gray-800
                    "
                  >
                    {activity.title}
                  </h3>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    {activity.description}
                  </p>


                  {activity.time && (

                    <div
                      className="
                        mt-1.5
                        flex
                        items-center
                        gap-1
                        text-xs
                        text-gray-400
                      "
                    >

                      <Clock size={12} />

                      {formatDate(activity.time)}

                    </div>

                  )}

                </div>



                {/* WORD COUNT */}

                <div
                  className="
                    hidden
                    shrink-0
                    text-right
                    sm:block
                  "
                >

                  <p className="text-sm font-semibold text-gray-700">
                    {activity.words.toLocaleString()}
                  </p>

                  <p className="text-xs text-gray-400">
                    words
                  </p>

                </div>


              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );
}



function formatDate(dateString: string) {

  try {

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return "";
    }


    return date.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );

  } catch {

    return "";

  }

}