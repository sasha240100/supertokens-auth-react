/* Copyright (c) 2021, VRAI Labs and/or its affiliates. All rights reserved.
 *
 * This software is licensed under the Apache License, Version 2.0 (the
 * "License") as published by the Apache Software Foundation.
 *
 * You may not use this file except in compliance with the License. You may
 * obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/*
 * Imports.
 */
import * as React from "react";
import RecipeModule from "./recipe/recipeModule";
import { ComponentWithRecipeAndMatchingMethod, NormalisedAppInfo, SuperTokensConfig } from "./types";
import { getCurrentNormalisedUrlPath, isTest, normaliseInputAppInfoOrThrowError } from "./utils";
import NormalisedURLPath from "./normalisedURLPath";
import { getSuperTokensRoutesForReactRouterDom } from "./components/superTokensRoute";
import { getSuperTokensRoutesForReactRouterDomV6 } from "./components/superTokensRouteV6";
import { BaseFeatureComponentMap } from "./types";
import { SSR_ERROR } from "./constants";
import { NormalisedConfig as NormalisedRecipeModuleConfig } from "./recipe/recipeModule/types";

/*
 * Class.
 */

export default class SuperTokens {
    /*
     * Static Attributes.
     */
    private static instance?: SuperTokens;

    private static reactRouterDom?: any;
    private static reactRouterDomIsV6: boolean | undefined = undefined;

    /*
     * Instance Attributes.
     */
    appInfo: NormalisedAppInfo;
    recipeList: RecipeModule<any, any, any, any>[] = [];
    private pathsToFeatureComponentWithRecipeIdMap?: BaseFeatureComponentMap;

    /*
     * Constructor.
     */
    constructor(config: SuperTokensConfig) {
        this.appInfo = normaliseInputAppInfoOrThrowError(config.appInfo);

        if (config.recipeList === undefined || config.recipeList.length === 0) {
            throw new Error(
                "Please provide at least one recipe to the supertokens.init function call. See https://supertokens.io/docs/emailpassword/quick-setup/frontend"
            );
        }

        this.recipeList = config.recipeList.map((recipe) => {
            return recipe(this.appInfo);
        });
    }

    /*
     * Static Methods.
     */
    static init(config: SuperTokensConfig): void {
        if (SuperTokens.instance !== undefined) {
            console.warn("SuperTokens was already initialized");
            return;
        }

        SuperTokens.instance = new SuperTokens(config);
    }

    static getInstanceOrThrow(): SuperTokens {
        if (SuperTokens.instance === undefined) {
            let error = "SuperTokens must be initialized before calling this method.";
            // eslint-disable-next-line supertokens-auth-react/no-direct-window-object
            if (typeof window === "undefined") {
                error = error + SSR_ERROR;
            }
            throw new Error(error);
        }

        return SuperTokens.instance;
    }

    static canHandleRoute(): boolean {
        return SuperTokens.getInstanceOrThrow().canHandleRoute();
    }

    static getRoutingComponent(): JSX.Element | undefined {
        return SuperTokens.getInstanceOrThrow().getRoutingComponent();
    }

    static getSuperTokensRoutesForReactRouterDom(reactRouterDom: any): JSX.Element[] {
        if (reactRouterDom === undefined) {
            throw new Error(
                // eslint-disable-next-line @typescript-eslint/quotes
                'Please use getSuperTokensRoutesForReactRouterDom like getSuperTokensRoutesForReactRouterDom(require("react-router-dom")) in your render function'
            );
        }
        SuperTokens.reactRouterDom = reactRouterDom;
        if (SuperTokens.reactRouterDomIsV6 === undefined) {
            SuperTokens.reactRouterDomIsV6 = reactRouterDom.withRouter === undefined;
        }
        if (SuperTokens.reactRouterDomIsV6) {
            // this function wraps the react-router-dom v6 useNavigate function in a way
            // that enforces that it runs within a useEffect. The reason we do this is
            // cause of https://github.com/remix-run/react-router/issues/7460
            // which gets shown when visiting a social auth callback url like
            // /auth/callback/github, without a valid code or state. This then
            // doesn't navigate the user to the auth page.
            const useNavigateHookForRRDV6 = function (): (to: string) => void {
                const navigateHook = reactRouterDom.useNavigate();
                const actualResolve = React.useRef<any>(undefined);
                const toReturn = function (to: string) {
                    if (actualResolve.current === undefined) {
                        setTimeout(() => {
                            toReturn(to);
                        }, 0);
                    } else {
                        actualResolve.current(to);
                    }
                };
                React.useEffect(() => {
                    function somFunc() {
                        new Promise((resolve) => {
                            actualResolve.current = resolve;
                        }).then((to) => {
                            navigateHook(to);
                            somFunc();
                        });
                    }
                    somFunc();
                }, [navigateHook]);
                return toReturn;
            };
            SuperTokens.reactRouterDom.useHistoryCustom = useNavigateHookForRRDV6;

            return getSuperTokensRoutesForReactRouterDomV6(SuperTokens.getInstanceOrThrow());
        }
        SuperTokens.reactRouterDom.useHistoryCustom = reactRouterDom.useHistory;
        return getSuperTokensRoutesForReactRouterDom(SuperTokens.getInstanceOrThrow());
    }

    /*
     * Instance Methods.
     */
    canHandleRoute = (): boolean => {
        return this.getRoutingComponent() !== undefined;
    };

    getRoutingComponent = (): JSX.Element | undefined => {
        const normalisedPath = getCurrentNormalisedUrlPath();
        const FeatureComponentWithRecipeId = this.getMatchingComponentForRouteAndRecipeId(normalisedPath);
        if (FeatureComponentWithRecipeId === undefined) {
            return undefined;
        }
        return <FeatureComponentWithRecipeId.component />;
    };

    getPathsToFeatureComponentWithRecipeIdMap = (): BaseFeatureComponentMap => {
        // Memoized version of the map.
        if (this.pathsToFeatureComponentWithRecipeIdMap !== undefined) {
            return this.pathsToFeatureComponentWithRecipeIdMap;
        }

        const pathsToFeatureComponentWithRecipeIdMap: BaseFeatureComponentMap = {};
        for (let i = 0; i < this.recipeList.length; i++) {
            const recipe = this.recipeList[i];
            const features = recipe.getFeatures();
            const featurePaths = Object.keys(features);
            for (let j = 0; j < featurePaths.length; j++) {
                // If no components yet for this route, initialize empty array.
                const featurePath = featurePaths[j];
                if (pathsToFeatureComponentWithRecipeIdMap[featurePath] === undefined) {
                    pathsToFeatureComponentWithRecipeIdMap[featurePath] = [];
                }

                pathsToFeatureComponentWithRecipeIdMap[featurePath].push(features[featurePath]);
            }
        }

        this.pathsToFeatureComponentWithRecipeIdMap = pathsToFeatureComponentWithRecipeIdMap;
        return this.pathsToFeatureComponentWithRecipeIdMap;
    };

    getMatchingComponentForRouteAndRecipeId = (
        normalisedUrl: NormalisedURLPath
    ): ComponentWithRecipeAndMatchingMethod | undefined => {
        const path = normalisedUrl.getAsStringDangerous();
        const routeComponents = this.getPathsToFeatureComponentWithRecipeIdMap()[path];
        if (routeComponents === undefined) {
            return undefined;
        }

        const component = routeComponents.find((c) => c.matches());
        if (component !== undefined) {
            return component;
        }

        // Otherwise, If no recipe Id provided, or if no recipe id matches, return the first matching component.
        return routeComponents[0];
    };

    getRecipeOrThrow<T, S, R, N extends NormalisedRecipeModuleConfig<T, S, R>>(
        recipeId: string
    ): RecipeModule<T, S, R, N> {
        const recipe = this.recipeList.find((recipe) => {
            return recipe.config.recipeId === recipeId;
        });

        if (recipe === undefined) {
            throw new Error(`Missing recipe: ${recipeId}`);
        }

        return recipe as RecipeModule<T, S, R, N>;
    }

    getReactRouterDom = (): { Route: any; useHistoryCustom: () => any } | undefined => {
        return SuperTokens.reactRouterDom;
    };

    /*
     * Tests methods.
     */
    static reset(): void {
        if (!isTest()) {
            return;
        }

        SuperTokens.instance = undefined;
        return;
    }
}
