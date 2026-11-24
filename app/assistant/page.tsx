import AssistantFlow from "@/components/AssistantFlow";

export const metadata = { title: "AI Beauty Assistant | Your Studio Name" };

export default function AssistantPage() {
  return (
    <main className="bg-blush py-14 lg:py-20">
      <div className="wrap">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl !text-brown lg:text-5xl">Let’s Discover Your Beauty.</h1>
          <p className="mt-4 text-lg">Upload a few pictures and let our beauty assistant help you discover makeup styles that complement your facial features.</p>
        </div>
        <AssistantFlow />
      </div>
    </main>
  );
}
