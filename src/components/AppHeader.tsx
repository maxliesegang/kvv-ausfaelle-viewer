import { KernButton, KernContainer, KernHeading, KernText } from "@kern-ux-annex/kern-react-kit";
import type { Theme } from "../hooks/useTheme";

interface AppHeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function AppHeader({ theme, onToggleTheme }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__accent" aria-hidden="true" />
      <KernContainer>
        <div className="app-header__bar">
          <div className="app-header__brand">
            <span className="app-header__mark" aria-hidden="true">
              KVV
            </span>
            <div className="app-header__titles">
              <KernHeading level={1} size="medium" className="app-header__title">
                Fahrtausfälle im KVV-Netz
              </KernHeading>
              <KernText type="body" size="small" muted className="app-header__subtitle">
                Gemeldete Ausfälle im S-Bahn-Netz
              </KernText>
            </div>
          </div>
          <KernButton
            label={theme === "dark" ? "Helles Design" : "Dunkles Design"}
            variant="tertiary"
            icon="autorenew"
            iconPosition="left"
            onClick={onToggleTheme}
          />
        </div>
      </KernContainer>
    </header>
  );
}
