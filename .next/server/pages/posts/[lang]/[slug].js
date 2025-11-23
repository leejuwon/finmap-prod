"use strict";
(() => {
var exports = {};
exports.id = 630;
exports.ids = [630];
exports.modules = {

/***/ 3248:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ AdInArticle)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);


function AdInArticle({ client ="ca-pub-1869932115288976" , slot  }) {
    const ref = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        try {
            if (window.adsbygoogle && ref.current) {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {}
    }, []);
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ins", {
        ref: ref,
        className: "adsbygoogle",
        style: {
            display: "block",
            textAlign: "center",
            minHeight: "120px"
        },
        "data-ad-client": client,
        "data-ad-slot": slot,
        "data-ad-format": "fluid",
        "data-ad-layout": "in-article",
        "data-full-width-responsive": "true"
    });
}


/***/ }),

/***/ 1137:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (/* binding */ AdResponsive)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
// _components/AdResponsive.js


function AdResponsive({ client ="ca-pub-1869932115288976" , slot , align ="center"  }) {
    const ref = (0,react__WEBPACK_IMPORTED_MODULE_1__.useRef)(null);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        try {
            if (window.adsbygoogle && ref.current) {
                (adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {}
    }, []);
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
        style: {
            textAlign: align
        },
        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ins", {
            ref: ref,
            className: "adsbygoogle",
            style: {
                display: "block"
            },
            "data-ad-client": client,
            "data-ad-slot": slot,
            "data-ad-format": "auto",
            "data-full-width-responsive": "true"
        })
    });
}


/***/ }),

/***/ 280:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "g": () => (/* binding */ AD_CLIENT),
/* harmony export */   "x": () => (/* binding */ AD_SLOTS)
/* harmony export */ });
// config/adSlots.js
// AdSense 광고 단위를 한 곳에서 관리하기 위한 설정 파일
// 승인 전이면 slot ID는 빈 문자열("")로 두고, 승인 후 실제 ID만 넣으면 됨.
const AD_CLIENT = "ca-pub-1869932115288976"; // 너 계정 ID
const AD_SLOTS = {
    inArticle1: "1924002516",
    inArticle2: "3101352817",
    responsiveTop: "9858332854",
    responsiveBottom: "4881338348",
    sidebar: "6085898367"
};


/***/ }),

/***/ 2812:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "JsonLd": () => (/* binding */ JsonLd),
/* harmony export */   "default": () => (/* binding */ PostPage),
/* harmony export */   "getStaticPaths": () => (/* binding */ getStaticPaths),
/* harmony export */   "getStaticProps": () => (/* binding */ getStaticProps)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _components_SeoHead__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(8814);
/* harmony import */ var _components_AdResponsive__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1137);
/* harmony import */ var _components_AdInArticle__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(3248);
/* harmony import */ var _config_adSlots__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(280);
/* harmony import */ var _lib_posts__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(8904);
/* harmony import */ var html_react_parser__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(2905);
/* harmony import */ var _lib_lang__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(6915);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(1853);
/* harmony import */ var next_router__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(next_router__WEBPACK_IMPORTED_MODULE_8__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([_lib_posts__WEBPACK_IMPORTED_MODULE_6__, html_react_parser__WEBPACK_IMPORTED_MODULE_7__]);
([_lib_posts__WEBPACK_IMPORTED_MODULE_6__, html_react_parser__WEBPACK_IMPORTED_MODULE_7__] = __webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__);
// pages/posts/[lang]/[slug].js








 // ✅ 추가
 // ✅ 추가
function JsonLd({ data  }) {
    return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("script", {
        type: "application/ld+json",
        dangerouslySetInnerHTML: {
            __html: JSON.stringify(data)
        }
    });
}
function PostPage({ post , lang , otherLangAvailable  }) {
    var ref;
    const slug = post.slug;
    const router = (0,next_router__WEBPACK_IMPORTED_MODULE_8__.useRouter)();
    // ✅ UI 언어: 헤더 기준(ko/en)
    const { 0: uiLang , 1: setUiLang  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("ko");
    const isKo = uiLang === "ko";
    // 🔁 계산기와 동일한 언어 동기화 로직
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (true) return;
        const initial = (0,_lib_lang__WEBPACK_IMPORTED_MODULE_9__/* .getInitialLang */ .X)();
        setUiLang(initial === "en" ? "en" : "ko");
        const handler = (e)=>{
            const next = e.detail === "en" ? "en" : "ko"; // fm_lang_change detail = 'ko' | 'en'
            setUiLang(next);
        };
        window.addEventListener("fm_lang_change", handler);
        return ()=>window.removeEventListener("fm_lang_change", handler);
    }, []);
    // ✅ UI 언어(uiLang)와 URL의 lang이 다르고,
    //    다른 언어 버전이 있을 때만 해당 언어 URL로 이동
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (!otherLangAvailable) return; // 번역본 없는 글은 그대로 둠
        if (uiLang !== lang) {
            router.replace(`/posts/${uiLang}/${slug}`);
        }
    }, [
        uiLang,
        lang,
        slug,
        otherLangAvailable,
        router
    ]);
    const jsonld = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        datePublished: post.datePublished,
        dateModified: post.dateModified || post.datePublished,
        author: {
            "@type": "Organization",
            name: "FinMap"
        }
    };
    const { 0: likes , 1: setLikes  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(0);
    const { 0: comments , 1: setComments  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const { 0: commentForm , 1: setCommentForm  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)({
        nickname: "",
        password: "",
        content: ""
    });
    const { 0: shareUrl , 1: setShareUrl  } = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)(`https://www.finmaphub.com/posts/${lang}/${slug}`);
    const reloadComments = async ()=>{
        try {
            const res = await fetch(`/api/comments?slug=${slug}`);
            const data = await res.json();
            setComments(data.comments || []);
        } catch (e) {
            console.error(e);
        }
    };
    const reloadLikes = async ()=>{
        try {
            const res = await fetch(`/api/like?slug=${slug}`);
            const data = await res.json();
            setLikes(data.likes || 0);
        } catch (e) {
            console.error(e);
        }
    };
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        if (false) {}
        reloadLikes();
        reloadComments();
    }, [
        slug,
        lang
    ]);
    const handleLike = async ()=>{
        try {
            const res = await fetch(`/api/like?slug=${slug}`, {
                method: "POST"
            });
            const data = await res.json();
            if (data.likes != null) setLikes(data.likes);
        } catch (e) {
            console.error(e);
        }
    };
    const handleCommentChange = (e)=>{
        const { name , value  } = e.target;
        setCommentForm((prev)=>({
                ...prev,
                [name]: value
            }));
    };
    const handleCommentSubmit = async ()=>{
        if (!commentForm.nickname || !commentForm.password || !commentForm.content) {
            alert(isKo ? "닉네임, 비밀번호, 내용을 모두 입력해주세요." : "Please fill nickname, password and content.");
            return;
        }
        try {
            const res = await fetch(`/api/comments?slug=${slug}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(commentForm)
            });
            if (!res.ok) throw new Error("failed");
            await reloadComments();
            setCommentForm({
                nickname: "",
                password: "",
                content: ""
            });
        } catch (e) {
            console.error(e);
            alert(isKo ? "댓글 등록에 실패했습니다." : "Failed to submit comment.");
        }
    };
    const handleCommentEdit = async (comment)=>{
        const newContent = prompt(isKo ? "수정할 내용을 입력하세요." : "Enter new content.", comment.content || "");
        if (!newContent) return;
        const password = prompt(isKo ? "댓글 작성 시 입력한 비밀번호를 입력하세요." : "Enter the password you used when writing this comment.");
        if (!password) return;
        try {
            const res = await fetch(`/api/comments?slug=${slug}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: comment.id,
                    password,
                    content: newContent
                })
            });
            if (!res.ok) {
                const err = await res.json().catch(()=>({}));
                if (err.error === "invalid password") {
                    alert(isKo ? "비밀번호가 일치하지 않습니다." : "Invalid password.");
                } else {
                    alert(isKo ? "댓글 수정에 실패했습니다." : "Failed to edit comment.");
                }
                return;
            }
            await reloadComments();
        } catch (e) {
            console.error(e);
            alert(isKo ? "댓글 수정 중 오류가 발생했습니다." : "Error while editing comment.");
        }
    };
    const handleCommentDelete = async (comment)=>{
        const ok = confirm(isKo ? "정말 이 댓글을 삭제하시겠습니까?" : "Are you sure you want to delete this comment?");
        if (!ok) return;
        const password = prompt(isKo ? "댓글 작성 시 입력한 비밀번호를 입력하세요." : "Enter the password you used when writing this comment.");
        if (!password) return;
        try {
            const res = await fetch(`/api/comments?slug=${slug}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: comment.id,
                    password
                })
            });
            if (!res.ok) {
                const err = await res.json().catch(()=>({}));
                if (err.error === "invalid password") {
                    alert(isKo ? "비밀번호가 일치하지 않습니다." : "Invalid password.");
                } else {
                    alert(isKo ? "댓글 삭제에 실패했습니다." : "Failed to delete comment.");
                }
                return;
            }
            await reloadComments();
        } catch (e) {
            console.error(e);
            alert(isKo ? "댓글 삭제 중 오류가 발생했습니다." : "Error while deleting comment.");
        }
    };
    const handleShare = async ()=>{
        try {
            if (navigator.share) {
                await navigator.share({
                    title: post.title,
                    text: post.description || post.title,
                    url: shareUrl
                });
            } else if (navigator.clipboard) {
                await navigator.clipboard.writeText(shareUrl);
                alert(isKo ? "링크가 클립보드에 복사되었습니다." : "Link copied to clipboard.");
            } else {
                alert((isKo ? "링크를 직접 복사해주세요:\n" : "Please copy the link manually:\n") + shareUrl);
            }
        } catch (e) {
            console.error(e);
        }
    };
    let h2Index = 0;
    const contentWithInArticleAds = (0,html_react_parser__WEBPACK_IMPORTED_MODULE_7__["default"])(post.contentHtml, {
        replace (domNode) {
            if (domNode.type === "tag" && domNode.name === "h2") {
                h2Index += 1;
                const children = (0,html_react_parser__WEBPACK_IMPORTED_MODULE_7__.domToReact)(domNode.children);
                if (h2Index === 2) {
                    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                                children: children
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "my-6",
                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdInArticle__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                                    client: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_CLIENT */ .g,
                                    slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_SLOTS.inArticle1 */ .x.inArticle1
                                })
                            })
                        ]
                    });
                }
                if (h2Index === 4) {
                    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                                children: children
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                className: "my-6",
                                children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdInArticle__WEBPACK_IMPORTED_MODULE_4__/* ["default"] */ .Z, {
                                    client: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_CLIENT */ .g,
                                    slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_SLOTS.inArticle2 */ .x.inArticle2
                                })
                            })
                        ]
                    });
                }
                return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                    children: children
                });
            }
            return undefined;
        }
    });
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_SeoHead__WEBPACK_IMPORTED_MODULE_2__/* ["default"] */ .Z, {
                title: post.title,
                desc: post.description,
                url: `/posts/${lang}/${post.slug}`,
                image: post.cover
            }),
            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(JsonLd, {
                data: jsonld
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("article", {
                className: "prose prose-slate lg:prose-lg max-w-none bg-white border rounded-2xl shadow-card p-6",
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h1", {
                        children: post.title
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("p", {
                        className: "text-sm text-slate-500",
                        children: [
                            post.category,
                            " \xb7 ",
                            post.datePublished,
                            post.dateModified && post.dateModified !== post.datePublished ? ` · ${isKo ? "수정" : "Updated"}: ${post.dateModified}` : ""
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "my-4",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdResponsive__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                            client: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_CLIENT */ .g,
                            slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_SLOTS.responsiveTop */ .x.responsiveTop,
                            align: "center"
                        })
                    }),
                    post.cover && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("img", {
                        src: post.cover,
                        alt: post.title,
                        className: "w-full h-auto rounded-xl mt-4 mb-6"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "fm-post-body",
                        children: contentWithInArticleAds
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "mt-8 mb-4",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(_components_AdResponsive__WEBPACK_IMPORTED_MODULE_3__/* ["default"] */ .Z, {
                            client: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_CLIENT */ .g,
                            slot: _config_adSlots__WEBPACK_IMPORTED_MODULE_5__/* .AD_SLOTS.responsiveBottom */ .x.responsiveBottom,
                            align: "center"
                        })
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                        className: "mt-4 flex flex-wrap items-center gap-3 border-t pt-4",
                        children: [
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", {
                                type: "button",
                                onClick: handleLike,
                                className: "btn-secondary",
                                children: [
                                    "\uD83D\uDC4D ",
                                    isKo ? "좋아요" : "Like",
                                    " ",
                                    likes > 0 ? `(${likes})` : ""
                                ]
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("button", {
                                type: "button",
                                onClick: handleShare,
                                className: "btn-secondary",
                                children: [
                                    "\uD83D\uDD17 ",
                                    isKo ? "공유하기" : "Share"
                                ]
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("a", {
                                href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "text-xs text-sky-500 underline",
                                children: "X(Twitter)"
                            }),
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("a", {
                                href: `https://www.facebook.com/sharer.php?u=${encodeURIComponent(shareUrl)}`,
                                target: "_blank",
                                rel: "noopener noreferrer",
                                className: "text-xs text-blue-600 underline",
                                children: "Facebook"
                            })
                        ]
                    }),
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("section", {
                        className: "mt-6 border-t pt-4",
                        children: [
                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("h2", {
                                className: "text-base md:text-lg font-semibold mb-3",
                                children: isKo ? "댓글" : "Comments"
                            }),
                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                className: "grid gap-2 mb-4",
                                children: [
                                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                        className: "grid grid-cols-2 gap-2",
                                        children: [
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                name: "nickname",
                                                placeholder: isKo ? "닉네임" : "Nickname",
                                                className: "input",
                                                value: commentForm.nickname,
                                                onChange: handleCommentChange
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("input", {
                                                name: "password",
                                                type: "password",
                                                placeholder: isKo ? "비밀번호 (수정/삭제용)" : "Password (for edit/delete)",
                                                className: "input",
                                                value: commentForm.password,
                                                onChange: handleCommentChange
                                            })
                                        ]
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("textarea", {
                                        name: "content",
                                        placeholder: isKo ? "댓글을 입력하세요" : "Write a comment",
                                        className: "input min-h-[80px]",
                                        value: commentForm.content,
                                        onChange: handleCommentChange
                                    }),
                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                                        className: "flex justify-end",
                                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                            type: "button",
                                            className: "btn-primary",
                                            onClick: handleCommentSubmit,
                                            children: isKo ? "댓글 등록" : "Submit comment"
                                        })
                                    })
                                ]
                            }),
                            comments.length === 0 ? /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                className: "text-sm text-slate-500",
                                children: isKo ? "아직 댓글이 없습니다." : "No comments yet."
                            }) : /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("ul", {
                                className: "space-y-3",
                                children: comments.map((c)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("li", {
                                        className: "border rounded-lg px-3 py-2 bg-slate-50",
                                        children: [
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "flex items-center justify-between mb-1",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                                        className: "text-sm font-semibold",
                                                        children: c.nickname
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                                        className: "flex items-center gap-2",
                                                        children: c.created_at && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("span", {
                                                            className: "text-[11px] text-slate-400",
                                                            children: new Date(c.created_at).toLocaleString("ko-KR")
                                                        })
                                                    })
                                                ]
                                            }),
                                            /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("p", {
                                                className: "text-sm whitespace-pre-wrap mb-2",
                                                children: c.content
                                            }),
                                            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                                                className: "flex gap-2 justify-end",
                                                children: [
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                        type: "button",
                                                        className: "text-xs text-slate-500 hover:text-blue-600",
                                                        onClick: ()=>handleCommentEdit(c),
                                                        children: isKo ? "수정" : "Edit"
                                                    }),
                                                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("button", {
                                                        type: "button",
                                                        className: "text-xs text-slate-500 hover:text-red-600",
                                                        onClick: ()=>handleCommentDelete(c),
                                                        children: isKo ? "삭제" : "Delete"
                                                    })
                                                ]
                                            })
                                        ]
                                    }, c.id))
                            })
                        ]
                    }),
                    ((ref = post.tags) === null || ref === void 0 ? void 0 : ref.length) > 0 && /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "flex flex-wrap gap-2 mt-4",
                        children: post.tags.map((tag)=>/*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("span", {
                                className: "px-2 py-1 text-xs bg-slate-100 rounded-full",
                                children: [
                                    "#",
                                    tag
                                ]
                            }, tag))
                    })
                ]
            })
        ]
    });
}
async function getStaticPaths() {
    const slugsKo = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_6__/* .getAllSlugs */ .m)("ko");
    const slugsEn = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_6__/* .getAllSlugs */ .m)("en"); // ✅ 영어 슬러그도 읽기
    const paths = [
        ...slugsKo.map((slug)=>({
                params: {
                    lang: "ko",
                    slug
                }
            })),
        ...slugsEn.map((slug)=>({
                params: {
                    lang: "en",
                    slug
                }
            })), 
    ];
    return {
        paths,
        fallback: false
    };
}
async function getStaticProps({ params  }) {
    const { lang , slug  } = params;
    const post = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_6__/* .getPostBySlug */ .zQ)(lang, slug);
    // ✅ 반대 언어가 존재하는지 미리 체크
    const otherLang = lang === "ko" ? "en" : "ko";
    let otherLangAvailable = false;
    try {
        const otherPost = (0,_lib_posts__WEBPACK_IMPORTED_MODULE_6__/* .getPostBySlug */ .zQ)(otherLang, slug);
        if (otherPost) {
            otherLangAvailable = true;
        }
    } catch (e) {
        // 반대 언어 글이 없으면 그냥 false
        otherLangAvailable = false;
    }
    return {
        props: {
            post,
            lang,
            otherLangAvailable
        }
    };
}

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ }),

/***/ 8076:
/***/ ((module) => {

module.exports = require("gray-matter");

/***/ }),

/***/ 968:
/***/ ((module) => {

module.exports = require("next/head");

/***/ }),

/***/ 1853:
/***/ ((module) => {

module.exports = require("next/router");

/***/ }),

/***/ 6689:
/***/ ((module) => {

module.exports = require("react");

/***/ }),

/***/ 997:
/***/ ((module) => {

module.exports = require("react/jsx-runtime");

/***/ }),

/***/ 2905:
/***/ ((module) => {

module.exports = import("html-react-parser");;

/***/ }),

/***/ 8974:
/***/ ((module) => {

module.exports = import("marked");;

/***/ }),

/***/ 7147:
/***/ ((module) => {

module.exports = require("fs");

/***/ }),

/***/ 1017:
/***/ ((module) => {

module.exports = require("path");

/***/ })

};
;

// load runtime
var __webpack_require__ = require("../../../webpack-runtime.js");
__webpack_require__.C(exports);
var __webpack_exec__ = (moduleId) => (__webpack_require__(__webpack_require__.s = moduleId))
var __webpack_exports__ = __webpack_require__.X(0, [814,968], () => (__webpack_exec__(2812)));
module.exports = __webpack_exports__;

})();