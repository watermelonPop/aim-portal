import './App.css';
import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';

export function BasicSettingsBar({ isOpen, onClose, settings, setSettings, logout, setLoggedIn }) {
        const [tempCursorColor, setTempCursorColor] = useState(settings.cursor_color);

        const scrollEvent = useCallback((e) => {
                const target = e.target;
                localStorage.setItem("scroll-position-settings", target.scrollTop);
        }, []);

        const handleButtonAction = (action) => (e) => {
                e.preventDefault();
                e.stopPropagation();
                action();
        };

        const updateSettings = (updates) => {
                setSettings({ ...settings, ...updates });
        };

        useEffect(() => {
                if(localStorage.getItem("scroll-position-settings") === null){
                        localStorage.setItem("scroll-position-settings", 0);
                }
                document.getElementById("settingsScroll").scrollTop = localStorage.getItem("scroll-position-settings");
        }, []);

        return (
        <nav
        role="dialog"
        aria-label="Settings"
        className="settingsNav"
        id="settings"
        aria-hidden={!isOpen}
        onClick={(e) => e.stopPropagation()}
        data-testid="settings"
        >
        <div className="innerSettingsNav">
                <h2 className="settingsHeading">
                <button id="closeSettingPanel" onClick={onClose} aria-label="close" data-testid="closeSettingsBtn">
                x
                </button>
                <p>Settings</p>
                </h2>
                <ul onScroll={scrollEvent} id="settingsScroll" data-testid="settingsScroll">
                <li>
                <h3>Disability Profiles</h3>
                <ul className="disProfilesList">
                <li className="disProfiles">
                        <label>Dyslexia</label>
                        <button onClick={handleButtonAction(() => updateSettings({
                        font_size: "14px",
                        letter_spacing: "4.5px",
                        contrast: "50%"
                        }))} data-testid="dyslexiaBtn">set</button>
                </li>
                <li className="disProfiles">
                        <label>Visual Impairment</label>
                        <button onClick={handleButtonAction(() => updateSettings({
                        font_size: "16px",
                        letter_spacing: "2px",
                        contrast: "200%"
                        }))} data-testid="visImpBtn">set</button>
                </li>
                <li className="disProfiles">
                        <label>Default</label>
                        <button onClick={handleButtonAction(() => updateSettings({
                        font_size: "14px",
                        letter_spacing: "0px",
                        contrast: "100%"
                        }))} data-testid="defaultBtn">set</button>
                </li>
                </ul>
                </li>
                <li>
                <h3>Text Size</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                <button onClick={handleButtonAction(() => {
                        let curr = parseInt(settings.font_size.replace("px", ""));
                        updateSettings({ font_size: Math.max(0, curr - 1) + "px" });
                })} className="settingsBtn" aria-label="Decrease Text Size" data-testid="txtSizeDec">-</button>
                <label data-testid="txtSizeLabel">{settings.font_size}</label>
                <button onClick={handleButtonAction(() => {
                        let curr = parseInt(settings.font_size.replace("px", ""));
                        updateSettings({ font_size: (curr + 1) + "px" });
                })} className="settingsBtn" aria-label="Increase Text Size" data-testid="txtSizeInc">+</button>
                </form>
                </li>
                <li>
                <h3>Letter Spacing</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                <button onClick={handleButtonAction(() => {
                        let curr = parseInt(settings.letter_spacing.replace("px", ""));
                        updateSettings({ letter_spacing: Math.max(0, curr - 1) + "px" });
                })} className="settingsBtn" aria-label="Decrease Letter Spacing" data-testid="letterSpacingDec">-</button>
                <label data-testid="letterSpacingLabel">{settings.letter_spacing}</label>
                <button onClick={handleButtonAction(() => {
                        let curr = parseInt(settings.letter_spacing.replace("px", ""));
                        updateSettings({ letter_spacing: (curr + 1) + "px" });
                })} className="settingsBtn" aria-label="Increase Letter Spacing" data-testid="letterSpacingInc">+</button>
                </form>
                </li>
                <li>
                <h3>Contrast</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                <button onClick={handleButtonAction(() => {
                        let curr = parseInt(settings.contrast.replace("%", ""));
                        updateSettings({ contrast: Math.max(0, curr - 5) + "%" });
                })} className="settingsBtn" aria-label="Decrease Contrast" data-testid="contrastDec">-</button>
                <label data-testid="contrastLabel">{settings.contrast}</label>
                <button onClick={handleButtonAction(() => {
                        let curr = parseInt(settings.contrast.replace("%", ""));
                        updateSettings({ contrast: (curr + 5) + "%" });
                })} className="settingsBtn" aria-label="Increase Contrast" data-testid="contrastInc">+</button>
                </form>
                </li>
                <li>
                <h3>Cursor Color</h3>
                <form onSubmit={(e) => e.preventDefault()}>
                <input type="color" name="cursor_color" value={tempCursorColor} onChange={(e) => setTempCursorColor(e.target.value)} />
                <button onClick={handleButtonAction(() => updateSettings({ cursor_color: tempCursorColor }))} className="setBtn" aria-label="Set Cursor Color">set</button>
                </form>
                </li>
                <li>
                <button onClick={() => logout(setLoggedIn)} className="logOutBtn">log out</button>
                </li>
                </ul>
        </div>
        </nav>
        );
}

export default BasicSettingsBar;
