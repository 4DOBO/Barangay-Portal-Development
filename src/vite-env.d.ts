
// Tell TypeScript that standard image imports return a string (the URL path)
declare module "*.png" {
    const value: string;
    export default value;
}

declare module "*.jpg" {
    const value: string;
    export default value;
}

declare module "*.svg" {
    const value: string;
    export default value;
}

// Tell TypeScript to accept the ?url suffix you added earlier
declare module "*?url" {
    const value: string;
    export default value;
}