import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard.jsx";
import Transactions from "./pages/Transactions.jsx";
import Investments from "./pages/Investments.jsx";
import Analytics from "./pages/Analytics.jsx";

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/investments" element={<Investments />} />
        <Route path="/analytics" element={<Analytics />} />
        
      </Routes>
    </Router>
  );
}

export default App;
