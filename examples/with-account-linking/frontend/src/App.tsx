import "./App.css";
import SuperTokens, { SuperTokensWrapper } from "supertokens-auth-react";
import { getSuperTokensRoutesForReactRouterDom } from "supertokens-auth-react/ui";
import { SessionAuth } from "supertokens-auth-react/recipe/session";
import { Routes, BrowserRouter as Router, Route } from "react-router-dom";
import Home from "./Home";
import { PreBuiltUIList, SuperTokensConfig } from "./config";
import { LinkingPage } from "./LinkingPage";
import { LinkingCallbackPage } from "./LinkingCallbackPage";

SuperTokens.init(SuperTokensConfig);

function App() {
    return (
        <SuperTokensWrapper>
            <div className="App app-container">
                <Router>
                    <div className="fill">
                        <Routes>
                            {/* This shows the login UI on "/auth" route */}
                            {getSuperTokensRoutesForReactRouterDom(require("react-router-dom"), PreBuiltUIList)}

                            <Route
                                path="/link"
                                element={
                                    /* Showing the linking page only makes sense for logged in users */
                                    <SessionAuth>
                                        <LinkingPage />
                                    </SessionAuth>
                                }
                            />
                            <Route
                                path="/link/tpcallback/:thirdPartyId"
                                element={
                                    /* Showing the linking page only makes sense for logged in users */
                                    <SessionAuth>
                                        <LinkingCallbackPage />
                                    </SessionAuth>
                                }
                            />
                            <Route
                                path="/"
                                element={
                                    /* This protects the "/" route so that it shows
                                  <Home /> only if the user is logged in.
                                  Else it redirects the user to "/auth" */
                                    <SessionAuth>
                                        <Home />
                                    </SessionAuth>
                                }
                            />
                        </Routes>
                    </div>
                </Router>
            </div>
        </SuperTokensWrapper>
    );
}

export default App;
