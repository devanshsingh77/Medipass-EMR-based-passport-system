// HomeButton component - fixed green button at bottom right
import { useNavigate } from "react-router-dom";

export default function HomeButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/")}
      className="fixed bottom-4 right-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded shadow-lg transition-colors"
    >
      Home
    </button>
  );
}
