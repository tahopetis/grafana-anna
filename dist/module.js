import { AppPlugin as G } from "@grafana/data";
import { jsxs as i, jsx as r } from "react/jsx-runtime";
import { useTheme2 as h, Spinner as O, Alert as W, Stack as j, Button as $, Input as H, Badge as A, CollapsableSection as Q, CodeEditor as J, IconButton as Y, PanelChrome as L } from "@grafana/ui";
import { Component as _, useState as b, useRef as U, useEffect as z } from "react";
import { BehaviorSubject as K } from "rxjs";
const I = ({ size: a = "medium", text: e, inline: t = !1 }) => {
  const n = h(), o = {
    small: 16,
    medium: 24,
    large: 32
  };
  return /* @__PURE__ */ i(
    "div",
    {
      style: {
        display: t ? "inline-flex" : "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: n.spacing(1),
        padding: n.spacing(2)
      },
      children: [
        /* @__PURE__ */ r(O, { size: o[a] }),
        e && /* @__PURE__ */ r(
          "div",
          {
            style: {
              color: n.colors.text.secondary,
              fontSize: n.typography.size.sm,
              marginTop: n.spacing(1)
            },
            children: e
          }
        )
      ]
    }
  );
};
I.displayName = "LoadingSpinner";
class R extends _ {
  constructor(e) {
    super(e), this.handleReset = () => {
      this.setState({ hasError: !1, error: null });
    }, this.state = { hasError: !1, error: null };
  }
  static getDerivedStateFromError(e) {
    return { hasError: !0, error: e };
  }
  componentDidCatch(e, t) {
    console.error("ErrorBoundary caught an error:", e, t), this.props.onError?.(e, t);
  }
  render() {
    return this.state.hasError ? this.props.fallback ? this.props.fallback : /* @__PURE__ */ r(V, { error: this.state.error, onReset: this.handleReset }) : this.props.children;
  }
}
const V = ({ error: a, onReset: e }) => {
  const t = h();
  return /* @__PURE__ */ r(
    "div",
    {
      style: {
        padding: t.spacing(4),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px"
      },
      children: /* @__PURE__ */ r(W, { severity: "error", title: "Something went wrong", children: /* @__PURE__ */ i(j, { direction: "column", gap: 2, children: [
        /* @__PURE__ */ r("div", { children: "An unexpected error occurred. You can try refreshing the page or restarting the conversation." }),
        a && /* @__PURE__ */ r(
          "div",
          {
            style: {
              fontFamily: "monospace",
              fontSize: t.typography.size.sm,
              color: t.colors.text.secondary,
              backgroundColor: t.colors.background.secondary,
              padding: t.spacing(2),
              borderRadius: t.shape.radius.default
            },
            children: a.message
          }
        ),
        /* @__PURE__ */ r($, { variant: "primary", onClick: e, children: "Try Again" })
      ] }) })
    }
  );
}, E = ({
  children: a,
  variant: e = "primary",
  size: t = "md",
  disabled: n = !1,
  loading: o = !1,
  icon: s,
  onClick: l,
  type: p = "button",
  fullWidth: g = !1
}) => /* @__PURE__ */ r(
  $,
  {
    variant: e,
    size: t,
    disabled: n || o,
    icon: s,
    onClick: l,
    type: p,
    style: g ? { width: "100%" } : {},
    children: o ? "Loading..." : a
  }
);
E.displayName = "Button";
const S = ({
  children: a,
  title: e,
  description: t,
  actions: n,
  onClick: o,
  className: s
}) => {
  const l = h();
  return /* @__PURE__ */ i(
    "div",
    {
      className: s,
      onClick: o,
      style: {
        border: `1px solid ${l.colors.border.weak}`,
        borderRadius: l.shape.radius.default,
        padding: l.spacing(2),
        cursor: o ? "pointer" : "default",
        backgroundColor: l.colors.background.primary
      },
      children: [
        (e || t || n) && /* @__PURE__ */ i(
          "div",
          {
            style: {
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: l.spacing(2)
            },
            children: [
              /* @__PURE__ */ i("div", { style: { flex: 1 }, children: [
                e && /* @__PURE__ */ r(
                  "div",
                  {
                    style: {
                      fontSize: l.typography.size.lg,
                      fontWeight: l.typography.fontWeightMedium,
                      color: l.colors.text.primary,
                      marginBottom: l.spacing(0.5)
                    },
                    children: e
                  }
                ),
                t && /* @__PURE__ */ r(
                  "div",
                  {
                    style: {
                      fontSize: l.typography.size.sm,
                      color: l.colors.text.secondary
                    },
                    children: t
                  }
                )
              ] }),
              n && /* @__PURE__ */ r("div", { style: { display: "flex", gap: l.spacing(1) }, children: n })
            ]
          }
        ),
        /* @__PURE__ */ r("div", { style: { flex: 1 }, children: a })
      ]
    }
  );
};
S.displayName = "Card";
const M = ({
  value: a,
  onChange: e,
  placeholder: t,
  type: n = "text",
  disabled: o = !1,
  error: s,
  prefix: l,
  suffix: p,
  multiline: g = !1,
  rows: y = 3,
  maxLength: v,
  id: f,
  name: u,
  autoFocus: x = !1
}) => {
  const d = h();
  return g ? /* @__PURE__ */ i("div", { children: [
    /* @__PURE__ */ r(
      "textarea",
      {
        id: f,
        name: u,
        value: a,
        onChange: (c) => e(c.target.value),
        placeholder: t,
        disabled: o,
        rows: y,
        maxLength: v,
        autoFocus: x,
        style: {
          width: "100%",
          padding: d.spacing(1, 2),
          fontSize: d.typography.bodySmall.fontSize,
          fontFamily: d.typography.fontFamily,
          color: d.colors.text.primary,
          backgroundColor: d.colors.background.primary,
          border: `1px solid ${s ? d.colors.error.border : d.colors.border.weak}`,
          borderRadius: d.shape.radius.default,
          outline: "none",
          resize: "vertical",
          minHeight: "80px"
        }
      }
    ),
    s && /* @__PURE__ */ r(
      "div",
      {
        style: {
          color: d.colors.error.text,
          fontSize: d.typography.size.sm,
          marginTop: d.spacing(0.5)
        },
        children: s
      }
    )
  ] }) : /* @__PURE__ */ i("div", { children: [
    /* @__PURE__ */ r(
      H,
      {
        id: f,
        name: u,
        value: a,
        onChange: (c) => e(c.currentTarget.value),
        placeholder: t,
        type: n,
        disabled: o,
        prefix: l,
        suffix: p,
        maxLength: v,
        autoFocus: x,
        invalid: !!s
      }
    ),
    s && /* @__PURE__ */ r(
      "div",
      {
        style: {
          color: d.colors.error.text,
          fontSize: d.typography.size.sm,
          marginTop: d.spacing(0.5)
        },
        children: s
      }
    )
  ] });
};
M.displayName = "Input";
const P = ({ icon: a, title: e, description: t, action: n }) => {
  const o = h();
  return /* @__PURE__ */ i(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: o.spacing(4),
        textAlign: "center",
        minHeight: "300px"
      },
      children: [
        a && /* @__PURE__ */ r(
          "div",
          {
            style: {
              fontSize: "48px",
              marginBottom: o.spacing(2),
              color: o.colors.text.secondary
            },
            children: a
          }
        ),
        /* @__PURE__ */ r(
          "div",
          {
            style: {
              fontSize: o.typography.size.lg,
              fontWeight: o.typography.fontWeightMedium,
              color: o.colors.text.primary,
              marginBottom: o.spacing(1)
            },
            children: e
          }
        ),
        t && /* @__PURE__ */ r(
          "div",
          {
            style: {
              fontSize: o.typography.bodySmall.fontSize,
              color: o.colors.text.secondary,
              marginBottom: o.spacing(3),
              maxWidth: "400px"
            },
            children: t
          }
        ),
        n && /* @__PURE__ */ r("div", { children: n })
      ]
    }
  );
};
P.displayName = "EmptyState";
const k = "anna-conversations";
class X {
  constructor() {
    this.state$ = new K(this.loadState());
  }
  /**
   * Gets the current state as an observable
   */
  getState() {
    return this.state$.asObservable();
  }
  /**
   * Gets the current state value
   */
  getCurrentState() {
    return this.state$.value;
  }
  /**
   * Gets all conversations
   */
  getConversations() {
    return this.state$.value.conversations;
  }
  /**
   * Gets a specific conversation by ID
   */
  getConversation(e) {
    return this.state$.value.conversations.find((t) => t.id === e);
  }
  /**
   * Gets the active conversation
   */
  getActiveConversation() {
    const { activeConversationId: e, conversations: t } = this.state$.value;
    if (e)
      return t.find((n) => n.id === e);
  }
  /**
   * Creates a new conversation
   */
  createConversation(e = "New Chat") {
    const t = {
      id: this.generateId(),
      title: e,
      messages: [],
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }, n = this.state$.value;
    return this.setState({
      ...n,
      conversations: [...n.conversations, t],
      activeConversationId: t.id
    }), this.saveState(), t;
  }
  /**
   * Adds a message to a conversation
   */
  addMessage(e, t) {
    const n = this.state$.value.conversations, o = n.findIndex((p) => p.id === e);
    if (o === -1)
      throw new Error(`Conversation ${e} not found`);
    const s = {
      ...t,
      id: this.generateId(),
      timestamp: /* @__PURE__ */ new Date()
    }, l = {
      ...n[o],
      messages: [...n[o].messages, s],
      updatedAt: /* @__PURE__ */ new Date()
    };
    l.title === "New Chat" && t.role === "user" && l.messages.length === 1 && (l.title = t.content.slice(0, 50) + (t.content.length > 50 ? "..." : "")), n[o] = l, this.setState({
      ...this.state$.value,
      conversations: [...n]
    }), this.saveState();
  }
  /**
   * Updates a conversation's title
   */
  updateConversationTitle(e, t) {
    const n = this.state$.value.conversations, o = n.findIndex((s) => s.id === e);
    if (o === -1)
      throw new Error(`Conversation ${e} not found`);
    n[o] = {
      ...n[o],
      title: t,
      updatedAt: /* @__PURE__ */ new Date()
    }, this.setState({
      ...this.state$.value,
      conversations: [...n]
    }), this.saveState();
  }
  /**
   * Deletes a conversation
   */
  deleteConversation(e) {
    const t = this.state$.value.conversations.filter((o) => o.id !== e), n = this.state$.value.activeConversationId === e ? t.length > 0 ? t[0].id : null : this.state$.value.activeConversationId;
    this.setState({
      conversations: t,
      activeConversationId: n
    }), this.saveState();
  }
  /**
   * Sets the active conversation
   */
  setActiveConversation(e) {
    if (!this.state$.value.conversations.find((n) => n.id === e))
      throw new Error(`Conversation ${e} not found`);
    this.setState({
      ...this.state$.value,
      activeConversationId: e
    }), this.saveState();
  }
  /**
   * Clears all conversations
   */
  clearAll() {
    this.setState({
      conversations: [],
      activeConversationId: null
    }), this.saveState();
  }
  /**
   * Exports a conversation
   */
  exportConversation(e) {
    const t = this.getConversation(e);
    if (!t)
      throw new Error(`Conversation ${e} not found`);
    return JSON.stringify(t, null, 2);
  }
  /**
   * Imports a conversation
   */
  importConversation(e) {
    const t = JSON.parse(e);
    if (!t.id || !t.messages)
      throw new Error("Invalid conversation data");
    const n = this.state$.value;
    return this.setState({
      ...n,
      conversations: [...n.conversations, t],
      activeConversationId: t.id
    }), this.saveState(), t;
  }
  setState(e) {
    this.state$.next(e);
  }
  loadState() {
    try {
      const e = localStorage.getItem(k);
      if (e) {
        const t = JSON.parse(e);
        return t.conversations = t.conversations.map((n) => ({
          ...n,
          createdAt: new Date(n.createdAt),
          updatedAt: new Date(n.updatedAt),
          messages: n.messages.map((o) => ({
            ...o,
            timestamp: new Date(o.timestamp)
          }))
        })), t;
      }
    } catch (e) {
      console.error("Failed to load conversations from localStorage:", e);
    }
    return { conversations: [], activeConversationId: null };
  }
  saveState() {
    try {
      localStorage.setItem(k, JSON.stringify(this.state$.value));
    } catch (e) {
      console.error("Failed to save conversations to localStorage:", e);
    }
  }
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
const m = new X(), B = ({ message: a }) => {
  const e = h(), t = a.role === "user";
  return /* @__PURE__ */ r(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: t ? "flex-end" : "flex-start",
        marginBottom: e.spacing(1)
      },
      children: /* @__PURE__ */ i(
        "div",
        {
          style: {
            maxWidth: "80%",
            display: "flex",
            flexDirection: "column",
            gap: e.spacing(1)
          },
          children: [
            /* @__PURE__ */ i(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: e.spacing(1),
                  marginBottom: e.spacing(0.5)
                },
                children: [
                  /* @__PURE__ */ r(
                    A,
                    {
                      text: t ? "You" : "Anna",
                      color: t ? "blue" : "green",
                      style: { fontSize: e.typography.size.xs }
                    }
                  ),
                  a.metadata?.queryType && /* @__PURE__ */ r(
                    A,
                    {
                      text: a.metadata.queryType.toUpperCase(),
                      color: "purple",
                      style: { fontSize: e.typography.size.xs }
                    }
                  ),
                  /* @__PURE__ */ r(
                    "span",
                    {
                      style: {
                        fontSize: e.typography.size.xs,
                        color: e.colors.text.secondary
                      },
                      children: new Date(a.timestamp).toLocaleTimeString()
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ r(
              "div",
              {
                style: {
                  backgroundColor: t ? e.colors.primary.main : e.colors.background.secondary,
                  color: t ? "#FFFFFF" : e.colors.text.primary,
                  padding: e.spacing(1, 2),
                  borderRadius: e.shape.radius.default,
                  wordBreak: "break-word"
                },
                children: /* @__PURE__ */ r(Z, { content: a.content })
              }
            ),
            a.metadata?.error && /* @__PURE__ */ i(
              "div",
              {
                style: {
                  padding: e.spacing(1),
                  backgroundColor: e.colors.error.transparent,
                  border: `1px solid ${e.colors.error.border}`,
                  borderRadius: e.shape.radius.default,
                  color: e.colors.error.text,
                  fontSize: e.typography.size.sm
                },
                children: [
                  "Error: ",
                  a.metadata.error.message
                ]
              }
            ),
            a.metadata?.queryResult && /* @__PURE__ */ r(Q, { label: "Query Result", isOpen: !1, children: /* @__PURE__ */ i("div", { style: { marginTop: e.spacing(1) }, children: [
              /* @__PURE__ */ r(
                J,
                {
                  language: "promql",
                  value: a.metadata.queryResult.query,
                  readOnly: !0,
                  height: 100
                }
              ),
              a.metadata.queryResult.explanation && /* @__PURE__ */ r(
                "div",
                {
                  style: {
                    marginTop: e.spacing(1),
                    padding: e.spacing(1),
                    backgroundColor: e.colors.background.secondary,
                    borderRadius: e.shape.radius.default,
                    fontSize: e.typography.size.sm
                  },
                  children: a.metadata.queryResult.explanation
                }
              )
            ] }) })
          ]
        }
      )
    }
  );
}, Z = ({ content: a }) => /* @__PURE__ */ r("div", { className: "markdown-content", children: (() => {
  const t = /```(\w+)?\n([\s\S]*?)```/g, n = [];
  let o = 0, s;
  for (; (s = t.exec(a)) !== null; ) {
    s.index > o && n.push(/* @__PURE__ */ r("span", { children: a.slice(o, s.index) }, o));
    const l = s[2];
    n.push(
      /* @__PURE__ */ r(
        "pre",
        {
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.3)",
            padding: "8px",
            borderRadius: "4px",
            overflow: "auto",
            margin: "4px 0"
          },
          children: /* @__PURE__ */ r("code", { children: l })
        },
        s.index
      )
    ), o = t.lastIndex;
  }
  return o < a.length && n.push(/* @__PURE__ */ r("span", { children: a.slice(o) }, o)), n.length > 0 ? n : a;
})() });
B.displayName = "ChatMessage";
const T = ({ messages: a }) => {
  const e = h();
  return /* @__PURE__ */ r(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        gap: e.spacing(2)
      },
      children: a.map((t, n) => /* @__PURE__ */ r(B, { message: t }, t.id || n))
    }
  );
};
T.displayName = "MessageList";
const D = ({
  onSend: a,
  placeholder: e = "Type your message...",
  disabled: t = !1,
  maxLength: n = 5e3
}) => {
  const o = h(), [s, l] = b(""), p = () => {
    const y = s.trim();
    y && !t && (a(y), l(""));
  }, g = s.trim().length > 0 && !t;
  return /* @__PURE__ */ i(
    "div",
    {
      style: {
        display: "flex",
        gap: o.spacing(1),
        alignItems: "flex-end"
      },
      children: [
        /* @__PURE__ */ i("div", { style: { flex: 1 }, children: [
          /* @__PURE__ */ r(
            M,
            {
              value: s,
              onChange: l,
              placeholder: e,
              disabled: t,
              multiline: !0,
              rows: 1,
              maxLength: n
            }
          ),
          /* @__PURE__ */ i(
            "div",
            {
              style: {
                display: "flex",
                justifyContent: "space-between",
                marginTop: o.spacing(0.5)
              },
              children: [
                /* @__PURE__ */ r("div", { style: { fontSize: o.typography.size.xs, color: o.colors.text.secondary }, children: "Press Enter to send, Shift+Enter for new line" }),
                /* @__PURE__ */ i(
                  "div",
                  {
                    style: {
                      fontSize: o.typography.size.xs,
                      color: s.length > n * 0.9 ? o.colors.error.text : o.colors.text.secondary
                    },
                    children: [
                      s.length,
                      " / ",
                      n
                    ]
                  }
                )
              ]
            }
          )
        ] }),
        /* @__PURE__ */ r(
          Y,
          {
            name: "arrow-up",
            tooltip: "Send message",
            tooltipPlacement: "top",
            onClick: p,
            disabled: !g,
            style: {
              height: "32px",
              width: "32px"
            }
          }
        )
      ]
    }
  );
};
D.displayName = "ChatInput";
const N = ({
  conversationId: a,
  onNewConversation: e,
  placeholder: t = "Ask Anna anything about your metrics, logs, alerts, or dashboards...",
  disabled: n = !1
}) => {
  const o = h(), [s, l] = b(a), [p, g] = b(!1), [y, v] = b(null), f = U(null), u = s ? m.getConversation(s) : void 0;
  z(() => {
    f.current?.scrollIntoView({ behavior: "smooth" });
  }, [u?.messages]), z(() => {
    if (!s) {
      const c = m.createConversation();
      l(c.id), e?.(c.id);
    }
  }, [s, e]);
  const x = async (c) => {
    if (!(!s || p || n)) {
      v(null), m.addMessage(s, {
        role: "user",
        content: c
      }), g(!0);
      try {
        const C = await ee(c);
        m.addMessage(s, {
          role: "assistant",
          content: C
        });
      } catch (C) {
        const w = C instanceof Error ? C.message : "Failed to send message";
        v(w), m.addMessage(s, {
          role: "assistant",
          content: `Sorry, I encountered an error: ${w}`,
          metadata: {
            error: {
              code: "CHAT_ERROR",
              message: w
            }
          }
        });
      } finally {
        g(!1);
      }
    }
  }, d = () => {
    if (s) {
      m.deleteConversation(s);
      const c = m.createConversation();
      l(c.id), e?.(c.id);
    }
  };
  return u ? /* @__PURE__ */ i(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: o.colors.background.primary
      },
      children: [
        /* @__PURE__ */ i(
          "div",
          {
            style: {
              padding: o.spacing(2),
              borderBottom: `1px solid ${o.colors.border.weak}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            },
            children: [
              /* @__PURE__ */ i("div", { children: [
                /* @__PURE__ */ r("div", { style: { fontWeight: 500, color: o.colors.text.primary }, children: u.title }),
                /* @__PURE__ */ i("div", { style: { fontSize: o.typography.size.sm, color: o.colors.text.secondary }, children: [
                  u.messages.length,
                  " messages"
                ] })
              ] }),
              /* @__PURE__ */ r(E, { variant: "secondary", size: "sm", onClick: d, children: "Clear Chat" })
            ]
          }
        ),
        /* @__PURE__ */ i("div", { style: { flex: 1, overflow: "auto", padding: o.spacing(2) }, children: [
          u.messages.length === 0 ? /* @__PURE__ */ r(
            P,
            {
              title: "Welcome to Anna!",
              description: /* @__PURE__ */ i("div", { children: [
                /* @__PURE__ */ r("p", { style: { margin: 0 }, children: "Your AI-powered assistant for Grafana observability. Ask me about metrics, logs, alerts, or dashboard creation." }),
                /* @__PURE__ */ i("p", { style: { marginTop: o.spacing(2), marginBottom: 0, fontSize: o.typography.size.sm, color: o.colors.text.secondary }, children: [
                  /* @__PURE__ */ r("strong", { children: "Note:" }),
                  " Please configure the Grafana LLM app plugin settings to enable AI capabilities. Go to Configuration → Plugins → Grafana LLM app to set up your AI provider."
                ] })
              ] })
            }
          ) : /* @__PURE__ */ r(T, { messages: u.messages }),
          p && /* @__PURE__ */ r(I, { text: "Anna is thinking..." }),
          /* @__PURE__ */ r("div", { ref: f })
        ] }),
        /* @__PURE__ */ i(
          "div",
          {
            style: {
              padding: o.spacing(2),
              borderTop: `1px solid ${o.colors.border.weak}`
            },
            children: [
              y && /* @__PURE__ */ r(
                "div",
                {
                  style: {
                    padding: o.spacing(1, 2),
                    marginBottom: o.spacing(1),
                    backgroundColor: o.colors.error.transparent,
                    border: `1px solid ${o.colors.error.border}`,
                    borderRadius: o.shape.radius.default,
                    color: o.colors.error.text,
                    fontSize: o.typography.size.sm
                  },
                  children: y
                }
              ),
              /* @__PURE__ */ r(
                D,
                {
                  onSend: x,
                  placeholder: t,
                  disabled: p || n
                }
              )
            ]
          }
        )
      ]
    }
  ) : /* @__PURE__ */ r("div", { style: { display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }, children: /* @__PURE__ */ r(I, { text: "Loading conversation..." }) });
};
async function ee(a) {
  await new Promise((t) => setTimeout(t, 1e3));
  const e = a.toLowerCase();
  return e.includes("promql") || e.includes("query") ? "I can help you with PromQL queries! Here's an example:\n\n```promql\nrate(http_requests_total[5m])\n```\n\nThis calculates the per-second rate of HTTP requests over the last 5 minutes. Would you like me to explain more about PromQL?" : e.includes("alert") ? `I can help you analyze and understand alerts in Grafana. I can provide:

1. Alert correlation and grouping
2. Root cause analysis
3. Remediation suggestions

What would you like to know about your alerts?` : e.includes("dashboard") ? `I can help you create dashboards! Just describe what you want to monitor, and I'll generate appropriate panels and queries for you.

For example: "Create a dashboard for API performance monitoring"` : e.includes("anomaly") || e.includes("unusual") ? `I can help you detect anomalies in your metrics and logs. I use statistical analysis to identify:

1. Sudden spikes or drops
2. Unusual patterns
3. Deviations from baseline

What metric would you like me to analyze?` : `Hello! I'm Anna, your AI assistant for Grafana. I can help you with:

• **Query Generation** - Convert natural language to PromQL/LogQL
• **Anomaly Detection** - Find unusual patterns in your data
• **Alert Intelligence** - Analyze and correlate alerts
• **Dashboard Creation** - Generate dashboards from descriptions

What would you like help with?`;
}
N.displayName = "ChatInterface";
const q = () => /* @__PURE__ */ r(R, { children: /* @__PURE__ */ r(L, { title: "Anna - AI Assistant", children: /* @__PURE__ */ r("div", { style: { height: "calc(100vh - 100px)" }, children: /* @__PURE__ */ r(
  N,
  {
    placeholder: "Ask me anything about your metrics, logs, alerts, or dashboards..."
  }
) }) }) });
q.displayName = "ChatPage";
const F = () => /* @__PURE__ */ r(R, { children: /* @__PURE__ */ r(L, { title: "Settings", children: /* @__PURE__ */ i("div", { style: { padding: "16px" }, children: [
  /* @__PURE__ */ r(S, { title: "LLM Provider Configuration", description: "Configure your LLM provider", children: /* @__PURE__ */ i("div", { style: { padding: "16px" }, children: [
    /* @__PURE__ */ i("p", { style: { marginBottom: "16px" }, children: [
      "Anna uses the ",
      /* @__PURE__ */ r("strong", { children: "grafana-llm-app" }),
      " plugin for LLM integration. Please configure your LLM provider settings in the grafana-llm-app configuration."
    ] }),
    /* @__PURE__ */ i("div", { style: { marginBottom: "16px" }, children: [
      /* @__PURE__ */ r("h4", { style: { marginBottom: "8px" }, children: "Supported Providers:" }),
      /* @__PURE__ */ i("ul", { style: { marginBottom: "16px" }, children: [
        /* @__PURE__ */ r("li", { children: "OpenAI (GPT-4, GPT-3.5)" }),
        /* @__PURE__ */ r("li", { children: "Anthropic (Claude)" }),
        /* @__PURE__ */ r("li", { children: "Azure OpenAI" }),
        /* @__PURE__ */ r("li", { children: "Custom OpenAI-compatible endpoints" })
      ] })
    ] }),
    /* @__PURE__ */ i(
      "div",
      {
        style: {
          padding: "12px",
          backgroundColor: "rgba(255, 200, 0, 0.1)",
          borderLeft: "3px solid #ffc800",
          borderRadius: "4px"
        },
        children: [
          /* @__PURE__ */ r("strong", { children: "Note:" }),
          " Make sure you have installed and configured the grafana-llm-app plugin (version 0.22.0 or higher) before using Anna."
        ]
      }
    )
  ] }) }),
  /* @__PURE__ */ r(S, { title: "Data Source Configuration", description: "Available data sources for Anna", children: /* @__PURE__ */ i("div", { style: { padding: "16px" }, children: [
    /* @__PURE__ */ r("p", { children: "Anna automatically detects available Grafana data sources:" }),
    /* @__PURE__ */ i("ul", { children: [
      /* @__PURE__ */ r("li", { children: "Prometheus (for PromQL queries)" }),
      /* @__PURE__ */ r("li", { children: "Grafana Loki (for LogQL queries)" }),
      /* @__PURE__ */ r("li", { children: "Other Prometheus-compatible data sources" })
    ] })
  ] }) }),
  /* @__PURE__ */ r(S, { title: "Conversation History", description: "Manage your conversation history", children: /* @__PURE__ */ i("div", { style: { padding: "16px" }, children: [
    /* @__PURE__ */ r("p", { children: "Conversation history is stored locally in your browser. You can clear your history at any time." }),
    /* @__PURE__ */ r(
      "button",
      {
        onClick: () => {
          confirm("Are you sure you want to clear all conversation history?") && (localStorage.removeItem("anna-conversations"), window.location.reload());
        },
        style: {
          padding: "8px 16px",
          backgroundColor: "#ff6b6b",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        },
        children: "Clear History"
      }
    )
  ] }) })
] }) }) });
F.displayName = "ConfigPage";
const se = new G().setRootPage(q).addConfigPage({
  title: "Settings",
  icon: "cog",
  body: F,
  id: "anna-settings"
});
export {
  se as default
};
//# sourceMappingURL=module.js.map
