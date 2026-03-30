import { useState, useCallback } from "react";

export function useBlurLoad() {
    const [isLoaded, setIsLoaded] = useState(false);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    return {
        isLoaded,
        handleLoad,
        imageClassName: `transition-opacity duration-700 ease-in-out ${
      isLoaded ? "opacity-100" : "opacity-0"
    }`,
  };
}