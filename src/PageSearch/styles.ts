const searchCardStyle = {
    position: "fixed",
    top: 14,
    right: 24,
    zIndex: 1000,
    width: 280,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "5px 8px",
    background: "#ffffff",
    border: "1px solid #d9d9d9",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.14)",
} as const;

const searchInputWrapStyle = {
    position: "relative",
    flex: 1,
    minWidth: 0,
} as const;

const searchInputStyle = {
    width: "100%",
    height: 26,
    padding: "2px 42px 2px 8px",
    color: "#1f1f1f",
    fontSize: 12,
    lineHeight: "20px",
    background: "#ffffff",
    border: "1px solid #d9d9d9",
    borderRadius: 6,
    outline: "none",
} as const;

const searchCountStyle = {
    position: "absolute",
    top: "50%",
    right: 8,
    minWidth: 34,
    fontSize: 12,
    color: "#595959",
    textAlign: "right",
    transform: "translateY(-50%)",
    pointerEvents: "none",
} as const;

const searchActionsStyle = {
    display: "flex",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
} as const;

const searchArrowButtonStyle = {
    width: 24,
    minWidth: 24,
    height: 26,
    padding: 0,
    color: "#595959",
    fontSize: 18,
    lineHeight: "24px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 4,
    cursor: "pointer",
} as const;

const searchCloseButtonStyle = {
    width: 24,
    minWidth: 24,
    height: 26,
    padding: 0,
    color: "#595959",
    fontSize: 12,
    lineHeight: "24px",
    background: "transparent",
    border: "1px solid transparent",
    borderRadius: 4,
    cursor: "pointer",
} as const;

export const styles = {
    searchCardStyle,
    searchInputWrapStyle,
    searchInputStyle,
    searchCountStyle,
    searchActionsStyle,
    searchArrowButtonStyle,
    searchCloseButtonStyle,
}