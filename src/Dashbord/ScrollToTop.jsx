import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const el = document.querySelector(".dashboard-content");
    if (el) {
      el.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
