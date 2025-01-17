/// <reference types="react" />
import { RecipeRouter } from "../recipeRouter";
import SignInUpTheme from "./components/themes/signInUp";
import ThirdPartyPasswordless from "./recipe";
import type { GenericComponentOverrideMap } from "../../components/componentOverride/componentOverrideContext";
import type { RecipeFeatureComponentMap, FeatureBaseProps, UserContext } from "../../types";
export declare class ThirdPartyPasswordlessPreBuiltUI extends RecipeRouter {
    readonly recipeInstance: ThirdPartyPasswordless;
    static instance?: ThirdPartyPasswordlessPreBuiltUI;
    private thirdPartyPreBuiltUI;
    private passwordlessPreBuiltUI;
    constructor(recipeInstance: ThirdPartyPasswordless);
    static getInstanceOrInitAndGetInstance(): ThirdPartyPasswordlessPreBuiltUI;
    static getFeatures(useComponentOverrides?: () => GenericComponentOverrideMap<any>): RecipeFeatureComponentMap;
    static getFeatureComponent(
        componentName: "signInUp" | "linkClickedScreen" | "signinupcallback",
        props: FeatureBaseProps<{
            redirectOnSessionExists?: boolean;
            userContext?: UserContext;
        }>,
        useComponentOverrides?: () => GenericComponentOverrideMap<any>
    ): JSX.Element;
    getFeatureComponent: (
        componentName: "signInUp" | "linkClickedScreen" | "signinupcallback",
        props: FeatureBaseProps<{
            redirectOnSessionExists?: boolean;
            userContext?: UserContext;
        }>,
        useComponentOverrides?: () => GenericComponentOverrideMap<any>
    ) => JSX.Element;
    getFeatures: (useComponentOverrides?: () => GenericComponentOverrideMap<any>) => RecipeFeatureComponentMap;
    static reset(): void;
    static SignInAndUp: (
        prop?: FeatureBaseProps<{
            redirectOnSessionExists?: boolean;
            userContext?: UserContext;
        }>
    ) => JSX.Element;
    static ThirdPartySignInAndUpCallback: (
        prop: FeatureBaseProps<{
            userContext?: UserContext;
        }>
    ) => JSX.Element;
    static SignInUpTheme: typeof SignInUpTheme;
    static PasswordlessLinkClicked: (
        prop: FeatureBaseProps<{
            userContext?: UserContext;
        }>
    ) => JSX.Element;
}
declare const SignInAndUp: (
    prop?: FeatureBaseProps<{
        redirectOnSessionExists?: boolean;
        userContext?: UserContext;
    }>
) => JSX.Element;
declare const ThirdPartySignInAndUpCallback: (
    prop: FeatureBaseProps<{
        userContext?: UserContext;
    }>
) => JSX.Element;
declare const PasswordlessLinkClicked: (
    prop: FeatureBaseProps<{
        userContext?: UserContext;
    }>
) => JSX.Element;
export { SignInAndUp, ThirdPartySignInAndUpCallback, PasswordlessLinkClicked, SignInUpTheme };
