import './App.css';
import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faToggleOff, faToggleOn, faArrowLeft, faArrowRight} from '@fortawesome/free-solid-svg-icons';

export function BasicSettingsBar({ isOpen, onClose, settings, setSettings, logout, setLoggedIn }) {
        const categories = {
                Profiles: ['disability_profile'],
                Text: ['font_size', 'letter_spacing', 'align_text'],
                Visuals: ['contrast', 'saturation', 'background_color', 'foreground_color', 'text_color'],
                Cursor: ['cursor_color', 'cursor_border_color', 'cursor_size'],
                Interactions: ['mute_sounds', 'highlight_hover', 'highlight_hover_color'],
                Audio: ['mute_sounds'],
        };

        const fonts = ["Mitr", "Lexend", "Roboto", "Montserrat", "Lato", "Nunito"];

        const [selectedCategory, setSelectedCategory] = useState(null);

        const [tempVars, setTempVars] = useState({
                cursor_color: settings.cursor_color,
                cursor_border_color: settings.cursor_border_color,
                background_color: settings.background_color,
                foreground_color: settings.foreground_color,
                text_color: settings.text_color,
                highlight_hover_color: settings.highlight_hover_color,
                align_text: settings.align_text,
                font: settings.font,
        });

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
                const scrollY = localStorage.getItem("scroll-position-settings");
                const savedCategory = localStorage.getItem("selectedCategory");
              
                // Apply scroll position after mount
                const scrollContainer = document.getElementById("settingsScroll");
                if (scrollContainer && scrollY !== null) {
                  scrollContainer.scrollTop = parseInt(scrollY);
                }
              
                // Restore selected category
                if (savedCategory && savedCategory !== "main-menu") {
                  setSelectedCategory(savedCategory);
                }
        }, []);

        useEffect(() => {
                if(selectedCategory === null){
                        localStorage.setItem("selectedCategory", "main-menu");
                }else{
                        localStorage.setItem("selectedCategory", selectedCategory);
                }
        }, [selectedCategory]);

        BasicSettingsBar.setSelectedCategory = setSelectedCategory;
        BasicSettingsBar.selectedCategory = selectedCategory;

        return (
                <nav
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
                                {selectedCategory === null ? (
                                Object.keys(categories).map((cat) => (
                                <li key={cat}
                                >
                                        <a
                                        className={`categoryTabBtn ${selectedCategory === cat ? 'activeCategory' : ''}`}
                                        onClick={() => setSelectedCategory(cat)} data-testid={cat}>
                                                {cat}
                                                <FontAwesomeIcon icon={faArrowRight} aria-hidden="true" />
                                        </a>
                                </li>
                                ))
                                ) : selectedCategory === "Text" ? (
                                <>
                                        <li id="backSettingPanelOuter">
                                                <button aria-label="back" id="backSettingPanel" onClick={() => setSelectedCategory(null)}>
                                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                                </button>
                                                <h3>Text</h3>
                                        </li>
                                        <li>
                                                <h3 id="fontLabel">Font</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                <select
                                                        aria-labelledby="fontLabel"
                                                        id="font"
                                                        name="font"
                                                        value={tempVars.font}
                                                        onChange={(e) => setTempVars({ ...tempVars, font: e.target.value })}
                                                        >
                                                        {fonts.map((font) => (
                                                        <option key={font} value={font}>
                                                        {font}
                                                        </option>
                                                        ))}
                                                </select>

                                                <button
                                                type="button"
                                                onClick={handleButtonAction(() => updateSettings({ font: tempVars.font }))}
                                                className="setBtn"
                                                aria-label="Set Font"
                                                >
                                                set
                                                </button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Text Size</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                <button
                                                type="button"
                                                onClick={handleButtonAction(() => {
                                                let curr = parseInt(settings.font_size.replace("px", ""));
                                                updateSettings({ font_size: Math.max(0, curr - 1) + "px" });
                                                })}
                                                className="settingsBtn"
                                                aria-label="Decrease Text Size"
                                                data-testid="txtSizeDec"
                                                >
                                                -
                                                </button>
                                                <label data-testid='txtSizeLabel'>{settings.font_size}</label>
                                                <button
                                                type="button"
                                                onClick={handleButtonAction(() => {
                                                let curr = parseInt(settings.font_size.replace("px", ""));
                                                updateSettings({ font_size: (curr + 1) + "px" });
                                                })}
                                                className="settingsBtn"
                                                aria-label="Increase Text Size"
                                                data-testid="txtSizeInc"
                                                >
                                                +
                                                </button>
                                                </form>
                                        </li>

                                        <li>
                                                <h3>Letter Spacing</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                <button
                                                type="button"
                                                onClick={handleButtonAction(() => {
                                                let curr = parseInt(settings.letter_spacing.replace("px", ""));
                                                updateSettings({ letter_spacing: Math.max(0, curr - 1) + "px" });
                                                })}
                                                className="settingsBtn"
                                                aria-label="Decrease Letter Spacing"
                                                data-testid='letterSpacingDec'
                                                >
                                                -
                                                </button>
                                                <label data-testid='letterSpacingLabel'>{settings.letter_spacing}</label>
                                                <button
                                                type="button"
                                                onClick={handleButtonAction(() => {
                                                let curr = parseInt(settings.letter_spacing.replace("px", ""));
                                                updateSettings({ letter_spacing: (curr + 1) + "px" });
                                                })}
                                                className="settingsBtn"
                                                aria-label="Increase Letter Spacing"
                                                data-testid='letterSpacingInc'
                                                >
                                                +
                                                </button>
                                                </form>
                                        </li>

                                        <li>
                                                <h3 id="textAlignLabel">Text Align</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                <select
                                                aria-labelledby="textAlignLabel"
                                                name="align_text"
                                                value={tempVars.align_text}
                                                onChange={(e) => setTempVars({ ...tempVars, align_text: e.target.value })}
                                                >
                                                <option value="left">Left</option>
                                                <option value="center">Center</option>
                                                <option value="right">Right</option>
                                                </select>
                                                <button
                                                type="button"
                                                onClick={handleButtonAction(() => updateSettings({ align_text: tempVars.align_text }))}
                                                className="setBtn"
                                                aria-label="Set Text Align"
                                                >
                                                set
                                                </button>
                                                </form>
                                        </li>
                                </>
                        )  : selectedCategory === "Visuals" ? (
                                <>
                                        <li id="backSettingPanelOuter">
                                                <button aria-label="back" id="backSettingPanel" onClick={() => setSelectedCategory(null)} data-testid="backBtn">
                                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                                </button>
                                                <h3>Visuals</h3>
                                        </li>
                                        <li>
                                                <h3>Contrast</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <button type="button" onClick={handleButtonAction(() => {
                                                                let curr = parseInt(settings.contrast.replace("%", ""));
                                                                updateSettings({ contrast: Math.max(0, curr - 5) + "%" });
                                                        })} className="settingsBtn" aria-label="Decrease Contrast" data-testid="contrastDec">-</button>
                                                        <label data-testid="contrastLabel">{settings.contrast}</label>
                                                        <button type="button" onClick={handleButtonAction(() => {
                                                                let curr = parseInt(settings.contrast.replace("%", ""));
                                                                updateSettings({ contrast: (curr + 5) + "%" });
                                                        })} className="settingsBtn" aria-label="Increase Contrast" data-testid="contrastInc">+</button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Saturation</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <button type="button" onClick={handleButtonAction(() => {
                                                                let curr = parseInt(settings.saturation.replace("%", ""));
                                                                updateSettings({ saturation: Math.max(0, curr - 5) + "%" });
                                                        })} className="settingsBtn" aria-label="Decrease Saturation" data-testid="saturationDec">-</button>
                                                        <label>{settings.saturation}</label>
                                                        <button type="button" onClick={handleButtonAction(() => {
                                                                let curr = parseInt(settings.saturation.replace("%", ""));
                                                                updateSettings({ saturation: (curr + 5) + "%" });
                                                        })} className="settingsBtn" aria-label="Increase Saturation" data-testid="saturationInc">+</button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Background Color</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <input type="color" name="background_color" value={tempVars.background_color} onChange={(e) => setTempVars({...tempVars, background_color: e.target.value})} className="colorInput" data-testid="backgroundColorInput"/>
                                                        <button type="button" onClick={handleButtonAction(() => updateSettings({ background_color: tempVars.background_color }))} className="setBtn" aria-label="Set Background Color">set</button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Foreground Color</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <input type="color" name="foreground_color" value={tempVars.foreground_color} onChange={(e) => setTempVars({...tempVars, foreground_color: e.target.value})} className="colorInput" data-testid="foregroundColorInput"/>
                                                        <button type="button" onClick={handleButtonAction(() => updateSettings({ foreground_color: tempVars.foreground_color }))} className="setBtn" aria-label="Set Foreground Color">set</button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Text Color</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <input type="color" name="text_color" value={tempVars.text_color} onChange={(e) => setTempVars({...tempVars, text_color: e.target.value})} className="colorInput" data-testid="textColorInput"/>
                                                        <button type="button" onClick={handleButtonAction(() => updateSettings({ text_color: tempVars.text_color }))} className="setBtn" aria-label="Set Text Color">set</button>
                                                </form>
                                        </li>
                                </>
                        )  : selectedCategory === "Cursor" ? (
                                <>
                                        <li id="backSettingPanelOuter">
                                                <button aria-label="back" id="backSettingPanel" onClick={() => setSelectedCategory(null)}>
                                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                                </button>
                                                <h3>Cursor</h3>
                                        </li>
                                        <li>
                                                <h3>Cursor Size</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <button type="button" className="settingsBtn" aria-label="Decrease Cursor Size" onClick={handleButtonAction(() => {
                                                                let curr = Number(settings.cursor_size);
                                                                if(curr <= 0){
                                                                        curr = 1;
                                                                }
                                                                updateSettings({ cursor_size: (curr - 1)});
                                                        })}>-</button>
                                                        <label data-testid="cursorSizeLabel">{settings.cursor_size}</label>
                                                        <button type="button" className="settingsBtn" aria-label="Increase Cursor Size" onClick={handleButtonAction(() => {
                                                                let curr = Number(settings.cursor_size);
                                                                updateSettings({ cursor_size: (curr + 1)});
                                                        })}>+</button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Cursor Color</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <input type="color" name="cursor_color" value={tempVars.cursor_color} onChange={(e) => setTempVars({...tempVars, cursor_color: e.target.value})} className="colorInput"/>
                                                        <button type="button" onClick={handleButtonAction(() => updateSettings({ cursor_color: tempVars.cursor_color }))} className="setBtn" aria-label="Set Cursor Color">set</button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Cursor Border Color</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <input type="color" name="cursor_border_color" value={tempVars.cursor_border_color} onChange={(e) => setTempVars({...tempVars, cursor_border_color: e.target.value})} className="colorInput"/>
                                                        <button type="button" onClick={handleButtonAction(() => updateSettings({ cursor_border_color: tempVars.cursor_border_color }))} className="setBtn" aria-label="Set Cursor Border Color">set</button>
                                                </form>
                                        </li>
                                </>
                        )  : selectedCategory === "Audio" ? (
                                <>
                                        <li id="backSettingPanelOuter">
                                                <button aria-label="back" id="backSettingPanel" onClick={() => setSelectedCategory(null)}>
                                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                                </button>
                                                <h3>Audio</h3>
                                        </li>
                                        <li>
                                                <h3>Mute Sounds</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <button type="button" onClick={handleButtonAction(() => {
                                                                const newMuteValue = !settings.mute_sounds;
                                                                updateSettings({ mute_sounds: newMuteValue });

                                                                if (!newMuteValue) {
                                                                const alertSound = new Audio('/notif_on.mp3'); // replace with your actual sound file path
                                                                alertSound.play().catch((e) => {
                                                                        console.error('Failed to play alert sound:', e);
                                                                });
                                                                }
                                                                })} className="toggleBtn" aria-label="Toggle Mute Sounds">{settings.mute_sounds === true ? <FontAwesomeIcon className='toggleIcon' icon={faToggleOn} aria-hidden="true" /> : <FontAwesomeIcon icon={faToggleOff} className='toggleIcon' aria-hidden="true" />}</button>
                                                </form>
                                        </li>
                                </>
                        )  : selectedCategory === "Profiles" ? (
                                <>
                                        <li id="backSettingPanelOuter">
                                                <button aria-label="back" id="backSettingPanel" onClick={() => setSelectedCategory(null)}>
                                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                                </button>
                                                <h3>Accessibility Profiles</h3>
                                        </li>
                                        <li>
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
                                                        contrast: "100%",
                                                        cursor_color: "#000000",
                                                        cursor_size: 3,
                                                        cursor_border_color: "#FFFFFF",
                                                        background_color: "#FFEDED",
                                                        foreground_color: "#4F0000",
                                                        text_color: "#000000",
                                                        highlight_hover: false,
                                                        highlight_hover_color: "#BD180F",
                                                        align_text: "center",
                                                        saturation: "100%",
                                                        font: "Mitr",
                                                        }))} data-testid="defaultBtn">set</button>
                                                </li>
                                                </ul>
                                                </li>
                                </>
                        )  : selectedCategory === "Interactions" ? (
                                <>
                                        <li id="backSettingPanelOuter">
                                                <button aria-label="back" id="backSettingPanel" onClick={() => setSelectedCategory(null)}>
                                                        <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
                                                </button>
                                                <h3>Interactions</h3>
                                        </li>
                                        <li>
                                                <h3>Highlight Hover</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <button type="button" onClick={handleButtonAction(() => updateSettings({ highlight_hover: !settings.highlight_hover }))} className="toggleBtn" aria-label="Toggle Highlight Hover">{settings.highlight_hover === true ? <FontAwesomeIcon className='toggleIcon' icon={faToggleOn} aria-hidden="true" /> : <FontAwesomeIcon icon={faToggleOff} className='toggleIcon' aria-hidden="true" />}</button>
                                                </form>
                                        </li>
                                        <li>
                                                <h3>Highlight Hover Color</h3>
                                                <form onSubmit={(e) => e.preventDefault()}>
                                                        <input type="color" name="highlight_hover_color" value={tempVars.highlight_hover_color} onChange={(e) => setTempVars({...tempVars, highlight_hover_color: e.target.value})} className="colorInput" data-testid="highlightHoverInput"/>
                                                        <button type="button" onClick={handleButtonAction(() => updateSettings({ highlight_hover_color: tempVars.highlight_hover_color }))} className="setBtn" aria-label="Set Highlight Hover Color">set</button>
                                                </form>
                                        </li>
                                </>
                        ) : null
                        }
                        </ul>

                </div>
                </nav>
        );
}

export default BasicSettingsBar;
