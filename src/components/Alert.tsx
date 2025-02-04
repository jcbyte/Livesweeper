import { Alert, AlertProps } from "@heroui/alert";
import { motion } from "framer-motion";
import { createContext, ReactNode, useContext, useRef, useState } from "react";

type AlertConfig = AlertProps;

const AlertContext = createContext<{
	openAlert: (config: AlertConfig, duration?: number) => void;
	closeAlert: () => void;
}>({
	openAlert: () => {},
	closeAlert: () => {},
});

export function AlertProvider({ children }: { children?: ReactNode }) {
	const [open, setOpen] = useState<boolean>(false);
	const [config, setConfig] = useState<AlertConfig>({});
	const closeRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

	function openAlert(config: AlertConfig, duration: number = 3000) {
		setConfig(config);
		setOpen(true);

		clearTimeout(closeRef.current);
		if (duration > 0) {
			closeRef.current = setTimeout(() => {
				setOpen(false);
			}, duration);
		}
	}

	function closeAlert() {
		clearTimeout(closeRef.current);
		setOpen(false);
	}

	return (
		<AlertContext.Provider value={{ openAlert: openAlert, closeAlert: closeAlert }}>
			{children}
			<motion.div
      id="AAAA"
				className="fixed top-0 w-full px-8 pt-4"
				initial={{ y: -1000 }}
				animate={open ? { y: 0 } : { y: -(containerRef.current?.scrollHeight || 100) }}
				transition={{ duration: 0.3 }}
        ref={containerRef}
			>
				<Alert {...config} />
			</motion.div>
		</AlertContext.Provider>
	);
}

export function useAlert() {
	return useContext(AlertContext);
}
