import { Button } from "@/components/ui/button";

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white dark:bg-gh-header border-b border-gray-200 dark:border-gh-border px-4 py-2 flex items-center justify-between z-10">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          onClick={onMenuClick}
        >
          <i className="ri-menu-line text-xl"></i>
        </Button>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
          disabled={true}
        >
          <i className="ri-notification-3-line text-xl"></i>
        </Button>
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            disabled={true}
          >
            <i className="ri-github-fill text-xl"></i>
          </Button>
        </div>
      </div>
    </header>
  );
}
