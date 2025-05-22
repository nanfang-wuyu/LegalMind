'use client'; // Add this directive for client-side interactivity

import { useState } from 'react'; // Import useState

export default function Home() {
  // State for the user's question, AI response, and sources
  const [question, setQuestion] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [sources, setSources] = useState<{ name: string; url?: string; page?: number; snippet?: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en'); // Added state for selected language
  const [selectedExampleQuestion, setSelectedExampleQuestion] = useState(''); // Added state for example question

  const exampleQuestions = [
    "What are the legal implications of AI-generated art?",
    "Explain the concept of 'force majeure' in contract law.",
    "What are the data privacy requirements under GDPR for a small business?"
  ];

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(event.target.value);
  };

  const handleExampleQuestionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const question = event.target.value;
    setSelectedExampleQuestion(question);
    if (question) {
      setQuestion(question); // Update the main question input
    }
  };

  const handleNewChat = () => {
    setQuestion('');
    setAiResponse('');
    setSources([]);
    setSelectedExampleQuestion('');
    setError('');
    // setIsLoading(false); // Optionally reset loading state if it can get stuck
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError('');
    setAiResponse('');
    setSources([]);

    if (!question.trim()) {
      setError('Please enter a question.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: question }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      const data = await response.json();
      
      // Assuming the backend returns data in the format: { answer: "...", sources: [...] }
      // or { response: "...", sources: [...] } for the NestJS to RAG call
      setAiResponse(data.answer || data.response || 'No answer received.');
      setSources(data.sources || []);
      setQuestion(''); // Clear input after successful submission

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
        console.error('Failed to fetch AI response:', err);
        setAiResponse('Failed to get response.');
      } else {
        setError('An unknown error occurred.');
        console.error('Failed to fetch AI response: Unknown error');
        setAiResponse('Failed to get response due to an unknown error.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-8 pt-12 md:p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex mb-8">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          AI RAG Chat Interface
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          {/* Placeholder for future elements if needed */}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-xl">
        <form onSubmit={handleSubmit} className="mb-4">
          <label htmlFor="questionInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Ask a question:
          </label>
          <textarea
            id="questionInput"
            name="questionInput"
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-zinc-700 dark:text-white sm:text-sm p-2"
            placeholder="Type your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isLoading}
          ></textarea>
        
          <button
            type="submit"
            className="mt-3 mb-4 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Submitting...' : 'Submit Question'}
          </button>

          <button
            type="button" // Important: type="button" to prevent form submission
            onClick={handleNewChat}
            className="ml-2 mt-3 mb-4 rounded-md bg-gray-500 px-4 py-2 text-sm font-medium text-white hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 dark:bg-gray-600 dark:hover:bg-gray-700 disabled:opacity-50"
            disabled={isLoading} // Optionally disable if a request is in progress
          >
            New Chat
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
            Error: {error}
          </div>
        )}

        {/* AI Response Area */}
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">AI Response:</h3>
          <div
            id="aiResponseArea"
            className="mt-2 min-h-[100px] rounded-md border border-gray-300 bg-gray-50 p-4 dark:border-neutral-700 dark:bg-zinc-800 whitespace-pre-wrap" // Added whitespace-pre-wrap
          >
            {isLoading && !aiResponse && <p className="text-sm text-gray-500 dark:text-gray-400">Loading response...</p>}
            {aiResponse || (!isLoading && <p className="text-sm text-gray-500 dark:text-gray-400">Waiting for your question...</p>)}
          </div>
        </div>

        {/* Sources Area */}
        {sources.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cited Sources:</h3>
            <div className="mt-2 space-y-2">
              {sources.map((source, index) => (
                <div key={index} className="p-3 rounded-md border border-gray-300 bg-gray-50 dark:border-neutral-700 dark:bg-zinc-800">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{source.name}</p>
                  {source.url && (
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline dark:text-blue-400">
                      {source.url}
                    </a>
                  )}
                  {source.page && <p className="text-xs text-gray-500 dark:text-gray-400">Page: {source.page}</p>}
                  {source.snippet && <p className="text-xs text-gray-500 dark:text-gray-400">Snippet: "{source.snippet}"</p>}
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Example Questions Dropdown */}
        <div className="mt-8">
          <label htmlFor="exampleQuestionSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Or select an example question:
          </label>
          <select
            id="exampleQuestionSelect"
            name="exampleQuestionSelect"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-zinc-700 dark:text-white sm:text-sm p-2"
            value={selectedExampleQuestion}
            onChange={handleExampleQuestionChange}
          >
            <option value="" disabled>Select an example question...</option>
            {exampleQuestions.map((q, index) => (
              <option key={index} value={q}>{q}</option>
            ))}
          </select>
        </div>

        {/* Placeholder for Language Switcher */}
        {/* Language Switcher Dropdown */}
        <div className="mt-4">
          <label htmlFor="languageSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Select Language:
          </label>
          <select
            id="languageSelect"
            name="languageSelect"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-neutral-700 dark:bg-zinc-700 dark:text-white sm:text-sm p-2"
            value={selectedLanguage}
            onChange={handleLanguageChange}
          >
            <option value="en">English</option>
            <option value="de">German</option>
          </select>
        </div>
      </div>
    </main>
  );
}
