import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Library from "./pages/library";
import Player from "./pages/player";
import DesignKitDemo from "./pages/_design";
import { ThemeProvider } from "@/components/theme-provider";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/library" element={<Library />} />
          <Route path="/library/:system" element={<Library />} />
          <Route path="/play" element={<Player />} />
          <Route path="/emu" element={<Emu />} />
          <Route path="/_design" element={<DesignKitDemo />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
