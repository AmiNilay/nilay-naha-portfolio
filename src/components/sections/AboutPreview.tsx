import Link from "next/link";

export default function AboutPreview() {
  return (
    <section className="container mx-auto px-4 max-w-4xl text-center">
      <h2 className="text-4xl md:text-5xl font-bold mb-8">About Me</h2>
      <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
        <p>
          I am a <strong>B.Tech student specializing in AI & ML</strong> at Siliguri Institute of Technology. 
          My journey started with a diploma in Computer Science, and I have been building software ever since.
        </p>
        <p>
          I love solving complex problems using <strong>Python</strong> and building interactive web experiences with <strong>Next.js</strong>. 
          When I'm not coding, I'm exploring new AI models or working on my sign language translation glove.
        </p>
      </div>
      <div className="mt-10">
        <Link 
          href="/about" 
          className="px-8 py-3 rounded-full border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          Read More About Me
        </Link>
      </div>
    </section>
  );
}