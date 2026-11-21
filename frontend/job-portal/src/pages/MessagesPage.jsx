import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import Navbar from "../components/layout/Navbar";
import { useAuth } from "../context/useAuth";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";

const MessagesPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [people, setPeople] = useState([]);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const response = await axiosInstance.get(API_PATHS.MESSAGES.USERS, {
          params: { q: query },
        });
        setPeople(response.data);
      } catch {
        toast.error(t("tryAgain"));
      }
    }, 250);
    return () => clearTimeout(timeout);
  }, [query, t]);

  const loadConversation = useCallback(async () => {
    if (!selectedPerson) return;
    try {
      const response = await axiosInstance.get(
        API_PATHS.MESSAGES.CONVERSATION(selectedPerson._id)
      );
      setMessages(response.data);
    } catch {
      toast.error(t("tryAgain"));
    }
  }, [selectedPerson, t]);

  useEffect(() => {
    void loadConversation();
    if (!selectedPerson) return undefined;
    const interval = setInterval(loadConversation, 5000);
    return () => clearInterval(interval);
  }, [loadConversation, selectedPerson]);

  const handleSend = async (event) => {
    event.preventDefault();
    if (!selectedPerson || !text.trim() || sending) return;

    setSending(true);
    try {
      await axiosInstance.post(
        API_PATHS.MESSAGES.CONVERSATION(selectedPerson._id),
        { text: text.trim() }
      );
      setText("");
      await loadConversation();
    } catch (error) {
      toast.error(error.response?.data?.message || t("tryAgain"));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FEF7F4]/95">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-8 pt-24">
        <h1 className="mb-5 text-2xl font-semibold text-[#2A2A2A]">
          {t("messages")}
        </h1>
        <div className="grid min-h-[70vh] overflow-hidden rounded-2xl border border-[#E8E1DD] bg-white md:grid-cols-[18rem_1fr]">
          <aside className="border-b border-[#E8E1DD] p-4 md:border-b-0 md:border-r">
            <label className="sr-only" htmlFor="people-search">
              {t("searchPeople")}
            </label>
            <input
              id="people-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("searchPeople")}
              className="w-full rounded-lg border border-[#D8D1CE] px-3 py-2"
            />
            <div className="mt-3 max-h-80 space-y-1 overflow-y-auto md:max-h-[60vh]">
              {people.map((person) => (
                <button
                  type="button"
                  key={person._id}
                  onClick={() => setSelectedPerson(person)}
                  className={`w-full rounded-lg px-3 py-2 text-left ${
                    selectedPerson?._id === person._id
                      ? "bg-orange-50 text-[#2A2A2A]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <span className="block truncate font-medium">{person.name}</span>
                  <span className="block truncate text-xs text-[#6B6A6A]">
                    {person.companyName || person.email}
                  </span>
                </button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-[60vh] flex-col">
            {selectedPerson ? (
              <>
                <header className="border-b border-[#E8E1DD] px-4 py-3">
                  <h2 className="font-semibold text-[#2A2A2A]">
                    {selectedPerson.name}
                  </h2>
                </header>
                <div
                  aria-live="polite"
                  className="flex-1 space-y-3 overflow-y-auto p-4"
                >
                  {messages.length === 0 ? (
                    <p className="text-sm text-[#6B6A6A]">{t("noMessages")}</p>
                  ) : (
                    messages.map((message) => {
                      const senderId =
                        typeof message.sender === "string"
                          ? message.sender
                          : message.sender?._id;
                      const ownMessage = senderId === user?._id;
                      return (
                        <div
                          key={message._id}
                          className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                        >
                          <p
                            className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm ${
                              ownMessage
                                ? "bg-[#EB611F] text-white"
                                : "bg-gray-100 text-[#2A2A2A]"
                            }`}
                          >
                            {message.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
                <form onSubmit={handleSend} className="flex gap-2 border-t border-[#E8E1DD] p-3">
                  <label className="sr-only" htmlFor="message-text">
                    {t("typeMessage")}
                  </label>
                  <input
                    id="message-text"
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    maxLength={5000}
                    placeholder={t("typeMessage")}
                    className="min-w-0 flex-1 rounded-lg border border-[#D8D1CE] px-3 py-2"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="rounded-lg bg-[#EB611F] px-4 py-2 font-semibold text-white disabled:opacity-60"
                  >
                    {t("sendMessage")}
                  </button>
                </form>
              </>
            ) : (
              <p className="m-auto p-6 text-center text-[#6B6A6A]">
                {t("selectConversation")}
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
};

export default MessagesPage;
