import Navbar from "@/components/Navbar";
import { Sparkles, ShieldCheck, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <section
        className="
          min-h-[calc(100vh-64px)]
          flex flex-col
          items-center
          justify-center
          text-center
          px-4
          sm:px-6
          lg:px-8
          py-16
          sm:py-20
          lg:py-24
        "
      >
        {/* Badge */}
        <div
          className="
            bg-purple-100
            text-purple-700
            px-4
            py-2
            rounded-full
            mb-5
            sm:mb-6
            text-sm
            sm:text-base
            font-medium
          "
        >
          ✨ AI Writing Revolution
        </div>

        {/* Heading */}
        <h1
          className="
            text-4xl
            sm:text-5xl
            md:text-6xl
            lg:text-7xl
            font-bold
            leading-tight
            max-w-5xl
          "
        >
          Humanize AI Text.
          <br />

          <span className="text-purple-600">
            Make Every Word Feel Human.
          </span>
        </h1>

        {/* Description */}
        <p
          className="
            mt-5
            sm:mt-6
            text-base
            sm:text-lg
            lg:text-xl
            text-gray-500
            max-w-2xl
            leading-relaxed
          "
        >
          Transform robotic AI-generated content into
          natural, authentic human writing.
        </p>

        {/* Buttons */}
        <div
          className="
            mt-8
            sm:mt-10
            flex
            flex-col
            sm:flex-row
            gap-4
            w-full
            sm:w-auto
          "
        >
          <button
            className="
              w-full
              sm:w-auto
              bg-purple-600
              hover:bg-purple-700
              text-white
              px-7
              sm:px-8
              py-3.5
              sm:py-4
              rounded-xl
              text-base
              sm:text-lg
              font-medium
              transition
            "
          >
            Humanize Now
          </button>

          <button
            className="
              w-full
              sm:w-auto
              border
              border-gray-200
              hover:border-purple-300
              hover:bg-purple-50
              px-7
              sm:px-8
              py-3.5
              sm:py-4
              rounded-xl
              text-base
              sm:text-lg
              font-medium
              transition
            "
          >
            View Demo
          </button>
        </div>

        {/* Feature Cards */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            lg:grid-cols-3
            gap-4
            sm:gap-6
            mt-14
            sm:mt-16
            lg:mt-20
            w-full
            max-w-5xl
          "
        >
          <Card
            icon={<Sparkles className="w-6 h-6" />}
            title="Natural Writing"
            description="Make AI-generated content sound natural and authentic."
          />

          <Card
            icon={<ShieldCheck className="w-6 h-6" />}
            title="Meaning Preserved"
            description="Keep your original meaning while improving your writing."
          />

          <Card
            icon={<Zap className="w-6 h-6" />}
            title="Instant Results"
            description="Transform your content quickly with AI-powered tools."
          />
        </div>
      </section>
    </div>
  );
}

interface CardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Card({ icon, title, description }: CardProps) {
  return (
    <div
      className="
        p-5
        sm:p-6
        bg-white
        rounded-2xl
        shadow-sm
        border
        border-gray-100
        text-left
        hover:shadow-md
        hover:-translate-y-1
        transition-all
        duration-200
      "
    >
      <div
        className="
          w-11
          h-11
          flex
          items-center
          justify-center
          rounded-xl
          bg-purple-50
          text-purple-600
          mb-4
        "
      >
        {icon}
      </div>

      <h3 className="font-semibold text-lg text-gray-900">
        {title}
      </h3>

      <p className="mt-2 text-sm sm:text-base text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}