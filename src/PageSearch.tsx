import type {FC, ReactNode} from "react";
import {useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";
import "./PageSearch.css";

type MatchRange = {
    end: number;
    id: number;
    start: number;
};

type SearchTextNode = {
    end: number;
    node: Text;
    start: number;
};

type PageSearchProps = {
    children: ReactNode;
};

const SEARCH_MARK_ATTR = "data-page-search-mark";
const SEARCH_MATCH_ID_ATTR = "data-page-search-match-id";
const SEARCH_UI_ATTR = "data-page-search-ui";

const searchCardStyle = {
    position: "fixed",
    top: 14,
    right: 24,
    zIndex: 1000,
    width: 352,
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

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const clearSearchMarks = (root: HTMLElement) => {
    const marks = Array.from(root.querySelectorAll<HTMLElement>(`mark[${SEARCH_MARK_ATTR}="true"]`));
    const parents = new Set<HTMLElement>();

    marks.forEach((mark) => {
        const parent = mark.parentElement;

        if (!parent) {
            return;
        }

        parents.add(parent);

        while (mark.firstChild) {
            parent.insertBefore(mark.firstChild, mark);
        }

        parent.removeChild(mark);
    });

    parents.forEach((parent) => {
        parent.normalize();
    });
};

const isSearchableTextNode = (node: Node) => {
    const textContent = node.textContent;

    if (!textContent || textContent.length === 0) {
        return false;
    }

    const parentElement = node.parentElement;

    if (!parentElement) {
        return false;
    }

    if (parentElement.closest(`[${SEARCH_UI_ATTR}="true"]`)) {
        return false;
    }

    if (parentElement.closest(`mark[${SEARCH_MARK_ATTR}="true"]`)) {
        return false;
    }

    if (parentElement.closest("script, style, noscript")) {
        return false;
    }

    const style = window.getComputedStyle(parentElement);

    if (style.display === "none" || style.visibility === "hidden") {
        return false;
    }

    return true;
};

const collectSearchTextNodes = (root: HTMLElement) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (node) => (isSearchableTextNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const textNodes: SearchTextNode[] = [];
    let cursor = 0;
    let currentNode = walker.nextNode();

    while (currentNode) {
        const text = currentNode.textContent ?? "";

        textNodes.push({
            node: currentNode as Text,
            start: cursor,
            end: cursor + text.length,
        });

        cursor += text.length;
        currentNode = walker.nextNode();
    }

    return textNodes;
};

const findAllMatches = (text: string, keyword: string) => {
    if (!keyword) {
        return [];
    }

    const matches: MatchRange[] = [];
    const pattern = new RegExp(escapeRegExp(keyword), "gi");
    let matchIndex = 0;

    for (const match of text.matchAll(pattern)) {
        const start = match.index;

        if (start === undefined) {
            continue;
        }

        matches.push({
            id: matchIndex,
            start,
            end: start + match[0].length,
        });

        matchIndex += 1;
    }

    return matches;
};

const wrapTextSegment = (node: Text, start: number, end: number, matchId: number, isActive: boolean) => {
    let target = node;

    if (start > 0) {
        target = target.splitText(start);
    }

    if (end - start < target.data.length) {
        target.splitText(end - start);
    }

    const mark = document.createElement("mark");
    mark.className = isActive ? "search-mark search-mark-active" : "search-mark";
    mark.dataset.pageSearchMark = "true";
    mark.dataset.pageSearchMatchId = String(matchId);
    mark.dataset.active = String(isActive);

    target.parentNode?.replaceChild(mark, target);
    mark.appendChild(target);
};

const applyHighlights = (root: HTMLElement, keyword: string, activeMatchIndex: number) => {
    clearSearchMarks(root);

    if (!keyword) {
        return 0;
    }

    const textNodes = collectSearchTextNodes(root);
    const fullText = textNodes.map(({node}) => node.textContent ?? "").join("");
    const matches = findAllMatches(fullText, keyword);

    for (let matchIndex = matches.length - 1; matchIndex >= 0; matchIndex -= 1) {
        const match = matches[matchIndex];

        for (let nodeIndex = textNodes.length - 1; nodeIndex >= 0; nodeIndex -= 1) {
            const textNode = textNodes[nodeIndex];

            if (textNode.start >= match.end) {
                continue;
            }

            if (textNode.end <= match.start) {
                break;
            }

            const segmentStart = Math.max(match.start, textNode.start) - textNode.start;
            const segmentEnd = Math.min(match.end, textNode.end) - textNode.start;

            wrapTextSegment(textNode.node, segmentStart, segmentEnd, match.id, match.id === activeMatchIndex);
        }
    }

    return matches.length;
};

export const PageSearch: FC<PageSearchProps> = ({children}) => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [keywordDraft, setKeywordDraft] = useState("");
    const [keyword, setKeyword] = useState("");
    const [activeMatchIndex, setActiveMatchIndex] = useState(0);
    const [matchCount, setMatchCount] = useState(0);
    const searchInputRef = useRef<HTMLInputElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const normalizedKeyword = useMemo(() => keyword.trim(), [keyword]);
    const searchCountLabel = normalizedKeyword ? (matchCount === 0 ? "0/0" : `${activeMatchIndex + 1}/${matchCount}`) : "";

    const closeSearch = () => {
        setIsSearchOpen(false);
        setKeyword("");
        setKeywordDraft("");
        setActiveMatchIndex(0);
    };

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "f") {
                event.preventDefault();
                setIsSearchOpen(true);

                requestAnimationFrame(() => {
                    searchInputRef.current?.focus();
                    searchInputRef.current?.select();
                });
            }

            if (event.key === "Escape") {
                closeSearch();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useLayoutEffect(() => {
        const root = contentRef.current;

        if (!root) {
            return;
        }

        const nextMatchCount = applyHighlights(root, normalizedKeyword, activeMatchIndex);
        setMatchCount((current) => (current === nextMatchCount ? current : nextMatchCount));
    }, [activeMatchIndex, children, normalizedKeyword]);

    useEffect(() => {
        if (matchCount === 0) {
            setActiveMatchIndex(0);
            return;
        }

        setActiveMatchIndex((current) => {
            if (current >= matchCount) {
                return 0;
            }

            return current;
        });
    }, [matchCount]);

    useEffect(() => {
        const root = contentRef.current;

        if (!root || normalizedKeyword.length === 0 || matchCount === 0) {
            return;
        }

        const activeMark = root.querySelector<HTMLElement>(
            `mark[${SEARCH_MARK_ATTR}="true"][${SEARCH_MATCH_ID_ATTR}="${activeMatchIndex}"]`,
        );

        activeMark?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    }, [activeMatchIndex, matchCount, normalizedKeyword]);

    const jumpToMatch = (direction: 1 | -1) => {
        if (matchCount === 0) {
            return;
        }

        setActiveMatchIndex((current) => (current + direction + matchCount) % matchCount);
    };

    return (
        <>
            {isSearchOpen ? (
                <div data-page-search-ui="true" style={searchCardStyle}>
                    <div style={searchInputWrapStyle}>
                        <input
                            autoComplete="off"
                            onChange={(event) => {
                                const nextKeyword = event.target.value;
                                setKeywordDraft(nextKeyword);
                                setKeyword(nextKeyword);
                                setActiveMatchIndex(0);
                            }}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    jumpToMatch(event.shiftKey ? -1 : 1);
                                }
                            }}
                            ref={searchInputRef}
                            style={searchInputStyle}
                            type="text"
                            value={keywordDraft}
                        />
                        <span
                            style={{
                                ...searchCountStyle,
                                color: matchCount === 0 && normalizedKeyword ? "#ff4d4f" : searchCountStyle.color,
                            }}
                        >
                            {searchCountLabel}
                        </span>
                    </div>
                    <div style={searchActionsStyle}>
                        <button
                            disabled={matchCount === 0}
                            onClick={() => jumpToMatch(-1)}
                            style={{
                                ...searchArrowButtonStyle,
                                color: matchCount === 0 ? "#bfbfbf" : searchArrowButtonStyle.color,
                            }}
                            type="button"
                        >
                            ∧
                        </button>
                        <button
                            disabled={matchCount === 0}
                            onClick={() => jumpToMatch(1)}
                            style={{
                                ...searchArrowButtonStyle,
                                color: matchCount === 0 ? "#bfbfbf" : searchArrowButtonStyle.color,
                            }}
                            type="button"
                        >
                            ∨
                        </button>
                        <button
                            onClick={closeSearch}
                            style={searchCloseButtonStyle}
                            type="button"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ) : null}
            <div ref={contentRef}>{children}</div>
        </>
    );
};
