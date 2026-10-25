/* React/data adapters for dudwo5/Mymy UI templates: kt/ktn/KHD/bub,
 * igHome/igProfile/igDM/igSheet, xHome. See NOTICE.txt for permission.
 * Author content, DOM globals, timers and media dependencies are excluded. */
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Search,
  Plus,
  Settings,
  Users,
  MessageCircle,
  MoreHorizontal,
  Heart,
  Home,
  Grid,
  Send,
  Bookmark,
  Repeat2,
  BarChart2,
  Share,
  User,
  Bell,
  X,
  Smile,
  Menu,
  Compass,
} from "lucide-react";
import type { SkinProps } from "../../AppSkins";
import { Avatar, Media } from "../../skins/shared";
import { useSkinState } from "../../skinState";
import { makeItem, type Item } from "../../schema";
import "./ui.css";
import "./adapter.css";
function grouped(items: Item[]) {
  return [...new Set(items.map((i) => i.title))].map((title) => ({
    title,
    items: items.filter((i) => i.title === title),
  }));
}
export function messageRun(items: Item[], index: number) {
  const m = items[index],
    previous = items[index - 1],
    next = items[index + 1];
  return {
    first:
      !previous ||
      previous.outgoing !== m.outgoing ||
      previous.sender !== m.sender,
    last: !next || next.outgoing !== m.outgoing || next.sender !== m.sender,
  };
}
const read = (p: SkinProps, i: Item) =>
  p.creator || i.password ? p.onItem(i) : p.onRead(i.id);
function Blank() {
  return <p className="mymy-empty">暂无内容</p>;
}
function Back({ onClick }: { onClick: () => void }) {
  return (
    <button aria-label="返回" onClick={onClick}>
      <ArrowLeft size={22} />
    </button>
  );
}
export function MymyKakao(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "聊天"),
    [sent, setSent] = useSkinState<string[]>(p, "mymyKktSent", []),
    [draft, setDraft] = useState(""),
    [query, setQuery] = useState(""),
    [menu, setMenu] = useState(false);
  const list = grouped(p.items),
    messages = [
      ...p.items.filter((i) => i.title === p.thread),
      ...sent.flatMap((raw, index) => {
        try {
          const entry: unknown = JSON.parse(raw);
          if (
            !Array.isArray(entry) ||
            entry.length !== 3 ||
            !entry.every((v) => typeof v === "string") ||
            entry[0] !== p.thread
          )
            return [];
          return [
            makeItem({
              id: "local-kkt-" + index,
              title: entry[0],
              body: entry[1],
              time: entry[2],
              sender: p.owner || "机主",
              outgoing: true,
              meta: { local: "true" },
            }),
          ];
        } catch {
          return [];
        }
      }),
    ],
    scroll = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = scroll.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [p.thread, messages.length]);
  return (
    <div className="mymy-ui mymy-kakao" data-mymy="kakao">
      {p.thread ? (
        <>
          <header className="kzth">
            <Back onClick={() => p.onThread("")} />
            <span className="kzname">{p.thread}</span>
            <span className="kzpill">
              <button aria-label="聊天菜单" onClick={() => setMenu(!menu)}>
                <Menu size={21} />
              </button>
            </span>
          </header>
          <div className="msgs kk" ref={scroll}>
            {messages.map((m, i) => {
              const run = messageRun(messages, i);
              return (
                <div
                  key={m.id}
                  className={
                    "kzm " +
                    (m.outgoing ? "kzmy" : "kzot") +
                    (run.first ? " first" : "")
                  }
                >
                  {!m.outgoing && run.first && (
                    <>
                      <div className="kzmav">
                        <Avatar name={m.sender} src={m.sender === "차우민" ? "https://i.pinimg.com/1200x/e4/32/a7/e432a74d5aac50eaefde332041f52c81.jpg" : m.avatar} />
                      </div>
                      <div className="kzmn">{m.sender}</div>
                    </>
                  )}
                  {m.outgoing && run.last && (
                    <span className="kzt">
                      {m.meta.unread || ""}
                      <br />
                      {m.time.slice(-5)}
                    </span>
                  )}
                  <button
                    className={"kzbub" + (m.media ? " kzimg" : "")}
                    onClick={() => m.meta.local !== "true" && read(p, m)}
                  >
                    {m.media ? <Media item={m} /> : m.body}
                  </button>
                  {!m.outgoing && run.last && (
                    <span className="kzt">{m.time.slice(-5)}</span>
                  )}
                </div>
              );
            })}
            {!messages.length && <Blank />}
          </div>
          <form
            className="kzinp"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              const last = messages.at(-1);
              let options: { label: string; value: string }[] = [];
              try {
                options = last?.meta.quickReplies ? JSON.parse(last.meta.quickReplies) : [];
              } catch {
                options = [];
              }
              if (last && !last.outgoing && p.onChatReply) {
                p.onChatReply(last, { label: draft.trim(), value: "typed" });
              } else {
                setSent([
                  ...sent,
                  JSON.stringify([
                    p.thread,
                    draft.trim(),
                    p.virtualTime || "09:41",
                  ]),
                ]);
              }
              setDraft("");
            }}
          >
            <button
              type="button"
              aria-label="添加聊天内容"
              onClick={() => (p.creator ? p.onAdd() : setMenu(!menu))}
            >
              <Plus size={21} />
            </button>
            <input
              aria-label="KKT消息"
              placeholder="输入消息"
              value={draft}
              maxLength={2000}
              onChange={(e) => setDraft(e.target.value)}
            />
            <Smile size={22} />
            <button
              className={draft.trim() ? "go" : ""}
              aria-label="发送KKT消息"
              disabled={!draft.trim()}
            >
              ↑
            </button>
          </form>
          {menu && (
            <div className="mymy-local-menu">
              <strong>{p.thread}</strong>
              <p>
                群成员：{[...new Set(messages.map((m) => m.sender))].join("、")}
              </p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </>
      ) : (
        <div className="kzkk">
          <div className="kzhd">
            <header className="kzkh">
              <b className="kzti">
                {tab === "好友" ? p.owner || "好友" : "聊天"}
              </b>
              <span className="kzic">
                <button
                  aria-label="搜索聊天"
                  onClick={() => setQuery(query ? "" : " ")}
                >
                  <Search size={21} />
                </button>
                {p.creator && (
                  <button aria-label="新增内容" onClick={p.onAdd}>
                    <Plus />
                  </button>
                )}
                <button aria-label="KKT设置" onClick={() => setMenu(!menu)}>
                  <Settings size={21} />
                </button>
              </span>
            </header>
            <div className="kzkc2">
              {["好友", "聊天"].map((t) => (
                <button
                  key={t}
                  className={
                    "kzkpl " +
                    (t === tab || (t === "为你推荐" && tab === "推荐")
                      ? "on"
                      : "")
                  }
                  onClick={() => setTab(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {query !== "" && (
              <input
                className="mymy-search"
                aria-label="搜索KKT"
                value={query.trimStart()}
                onChange={(e) => setQuery(e.target.value || " ")}
                placeholder="搜索"
              />
            )}
          </div>
          <div className="kzkb">
            <div className="kzksec">
              {tab === "好友" ? "好友" : "全部聊天"} {list.length}
            </div>
            {list
              .filter((g) => g.title.includes(query.trim()))
              .map((g) => {
                const last = g.items.at(-1)!;
                return (
                  <button
                    className="kzkr kzkcr"
                    key={g.title}
                    onClick={() => p.onThread(g.title)}
                  >
                    <Avatar name={last.sender || g.title} src={last.sender === "차우민" ? "https://i.pinimg.com/1200x/e4/32/a7/e432a74d5aac50eaefde332041f52c81.jpg" : last.avatar} />
                    <span className="kzkn">
                      <b>{g.title}</b>
                      <small>{tab === "好友" ? last.sender : last.body}</small>
                    </span>
                    <span className="kzkmt">
                      {last.time.slice(-5)}
                      {last.meta.unread && (
                        <i className="kzkbd">{last.meta.unread}</i>
                      )}
                    </span>
                  </button>
                );
              })}
            {!list.length && <Blank />}
          </div>
          <nav className="kzknv">
            {[Users, MessageCircle, Compass, Grid, MoreHorizontal].map(
              (Icon, i) => (
                <button
                  key={i}
                  aria-label={["好友", "聊天", "发现", "更多功能", "设置"][i]}
                  className={(tab === "好友" ? 0 : 1) === i ? "on" : ""}
                  onClick={() =>
                    i < 2 ? setTab(["好友", "聊天"][i]) : setMenu(true)
                  }
                >
                  <Icon />
                </button>
              ),
            )}
          </nav>
          {menu && (
            <div className="mymy-local-menu">
              <strong>KakaoTalk</strong>
              <p>作品内聊天</p>
              <button onClick={() => setMenu(false)}>完成</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
export function MymyInstagram(p: SkinProps) {
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "主页"),
    [liked, setLiked] = useSkinState<string[]>(p, "mymyLiked", []),
    [saved, setSaved] = useSkinState<string[]>(p, "mymySaved", []),
    [replies, setReplies] = useSkinState<string[]>(p, "mymyReplies", []),
    [seen, setSeen] = useSkinState<string[]>(p, "mymySeen", []);
  const [sheet, setSheet] = useState<Item | null>(null),
    [selected, setSelected] = useState<Item | null>(null),
    [story, setStory] = useState(0),
    [draft, setDraft] = useState(""),
    [pop, setPop] = useState("");
  const linaProfile = /莉娜|lina/i.test(p.owner || "");
  const [igAccount, setIgAccount] = useState<"lina" | "public" | "private">("lina");
  const igProfiles = {
    lina: { handle: "linaaa_", name: "linaaa_", avatar: "https://i.pinimg.com/736x/33/43/06/334306d4cabb96d1f66cc744c8045aec.jpg", bio: "serendipity  @_imnnin", count: "3", followers: "524", following: "446" },
    public: { handle: "_imnnin", name: "Woominwoo", avatar: "https://i.pinimg.com/736x/61/ee/d0/61eed02c1e2ee6b482da48f84ea4cb53.jpg", bio: "Woominwoo", count: "132", followers: "1.9M", following: "2" },
    private: { handle: "zhvho24", name: "zhvho24", avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3C/svg%3E", bio: "", count: "13", followers: "154", following: "154" }
  };
  const profile = igProfiles[igAccount];
  const wooPublicPosts: Item[] = [
    { id: "woo-public-1", title: "", body: "", richText: "", meta: {}, time: "2026-10-22", sender: "_imnnin", avatar: igProfiles.public.avatar, kind: "image", media: "https://pbs.twimg.com/media/HVdu9TFagAA8-d9?format=jpg&name=4096x4096", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 48200, comments: ["분위기 미쳤다 😭\\n氛圍真的絕了😭", "오늘도 잘생겼어요\\n今天也好帥"] },
    { id: "woo-public-2", title: "", body: "", richText: "", meta: {}, time: "2026-10-18", sender: "_imnnin", avatar: igProfiles.public.avatar, kind: "image", media: "https://pbs.twimg.com/media/HUZI8BlaUAAr909?format=jpg&name=4096x4096", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 126000, comments: ["이 사진 너무 좋아요\\n好喜歡這張照片", "화보 같아\\n像畫報一樣"] },
    { id: "woo-public-3", title: "", body: "", richText: "", meta: {}, time: "2026-10-15", sender: "_imnnin", avatar: igProfiles.public.avatar, kind: "image", media: "https://pbs.twimg.com/media/HULXaU5asAEChUP?format=jpg&name=4096x4096", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 76300, comments: ["최고야 🖤\\n最棒了🖤", "사랑해요\\n喜歡你"] },
    { id: "woo-public-4", title: "", body: "", richText: "", meta: {}, time: "2026-10-12", sender: "_imnnin", avatar: igProfiles.public.avatar, kind: "image", media: "https://pbs.twimg.com/media/HRGp8j6boAA1hsE?format=jpg&name=large", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 58300, comments: ["너무 멋있어요\\n太帥了", "이런 분위기 좋아\\n喜歡這種氛圍"] },
    { id: "woo-public-5", title: "", body: "", richText: "", meta: {}, time: "2026-10-08", sender: "_imnnin", avatar: igProfiles.public.avatar, kind: "image", media: "https://pbs.twimg.com/media/HRGp9cZaUAE1_RT?format=jpg&name=large", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 91700, comments: ["레전드 사진\\n神級照片", "잘생겼다\\n好帥"] },
    { id: "woo-public-6", title: "", body: "", richText: "", meta: {}, time: "2026-10-04", sender: "_imnnin", avatar: igProfiles.public.avatar, kind: "image", media: "https://pbs.twimg.com/media/HOJoSYdaEAAGIWu?format=jpg&name=4096x4096", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 147000, comments: ["기다렸어요 🖤\\n等你好久了🖤", "너무 좋아요\\n太喜歡了"] }
  ];
  const wooPrivateImages = [
    "https://i.pinimg.com/736x/68/b4/c4/68b4c465743015be7b5bf5a195a3b6e9.jpg",
    "https://i.pinimg.com/736x/ca/a8/85/caa885530fc32e28e8388d7da80361b4.jpg",
    "https://i.pinimg.com/736x/3c/65/09/3c65097195b8b1540d6d37e07f896915.jpg",
    "https://i.pinimg.com/736x/2a/f7/69/2af7695b0eb0514fe3419b6ec99d0f8d.jpg",
    "https://i.pinimg.com/736x/34/9f/0e/349f0e7a7ab31284fdc6dad148004ed4.jpg",
    "https://i.pinimg.com/736x/b8/ed/cb/b8edcbea1cb9ce47af8e0f00423561fe.jpg",
    "https://i.pinimg.com/736x/68/99/74/68997434c5b287900cf00535d3e26039.jpg",
    "https://i.pinimg.com/736x/c6/84/3a/c6843a50e541504c74f2e2db43cc3163.jpg",
    "https://i.pinimg.com/736x/e4/c4/28/e4c4289549e4cdb26d3a44d16c5949f7.jpg"
  ];
  const wooPrivatePosts: Item[] = wooPrivateImages.map((media, n) => ({ id: "woo-private-" + n, title: "", body: "", richText: "", meta: {}, time: "2026-10-" + String(24 - n).padStart(2, "0"), sender: "zhvho24", avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3C/svg%3E", kind: "image", media, hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 40 + n * 7, comments: ["ㅋㅋㅋㅋ\n哈哈哈", "이거 언제 찍었지\n這什麼時候拍的"], }));

  const linaPosts: Item[] = [
    { id: "lina-ig-photo", title: "🐾", body: "🐾", richText: "", meta: { handle: "linaaa_" }, time: "2026-10-20", sender: "linaaa_", avatar: "https://i.pinimg.com/736x/33/43/06/334306d4cabb96d1f66cc744c8045aec.jpg", kind: "image", media: "https://i.pinimg.com/1200x/a9/08/c2/a908c230613481912c91327bcbb602a6.jpg", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 87, comments: ["오늘도 예쁘다 🤍\\n今天也很漂亮🤍", "사진 분위기 너무 좋아\\n照片的氛圍真的很好"] },
    { id: "lina-ig-pose", title: ":3", body: ":3", richText: "", meta: { handle: "linaaa_" }, time: "2026-10-12", sender: "linaaa_", avatar: "https://i.pinimg.com/736x/fd/e0/62/fde06271c942e6db6378f560b29b1ca4.jpg", kind: "image", media: "https://i.pinimg.com/1200x/cf/c4/1a/cfc41a1ca255989a819cdcf33ae6be6c.jpg", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 132, comments: ["ㅋㅋㅋ 귀여워\\n哈哈哈，好可愛", "이 사진 진짜 좋아\\n真的很喜歡這張照片"] },
    { id: "lina-ig-cake", title: "❤️🍰", body: "❤️🍰", richText: "", meta: { handle: "linaaa_" }, time: "2026-09-28", sender: "linaaa_", avatar: "https://i.pinimg.com/736x/fd/e0/62/fde06271c942e6db6378f560b29b1ca4.jpg", kind: "image", media: "https://i.pinimg.com/1200x/cc/83/de/cc83ded3ccb56ec9c82c17e922a39745.jpg", hidden: false, unlock: "", password: "", folder: "", favorite: false, outgoing: false, read: false, likes: 64, comments: ["디저트 최고 🍰\\n甜點最棒了🍰", "맛있겠다!\\n看起來好好吃！"] }
  ];
  const posts = igAccount === "lina" ? [...linaPosts] : igAccount === "public" ? wooPublicPosts : wooPrivatePosts,
    allFeedPosts = [...linaPosts, ...wooPublicPosts, ...wooPrivatePosts],

    stories = p.items.filter((i) => i.meta.story === "true"),
    dms = [...p.items.filter((i) => i.folder === "私信"), ...[
      { id: "woo-dm-1", title: "zhvho24", body: "집 도착했어?\n到家了嗎？", richText: "", meta: {}, time: "23:18", sender: "zhvho24", avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3C/svg%3E", kind: "text" as const, media: "", hidden: false, unlock: "", password: "", folder: "私信", favorite: false, outgoing: false, read: false, likes: 0, comments: [] },
      { id: "woo-dm-2", title: "zhvho24", body: "오늘 사진 올린 거 봤어? 너 생각나서 보냈어.\n看到我今天發的照片了嗎？因為想到你才傳給你的。", richText: "", meta: {}, time: "23:21", sender: "zhvho24", avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3C/svg%3E", kind: "text" as const, media: "", hidden: false, unlock: "", password: "", folder: "私信", favorite: false, outgoing: false, read: false, likes: 0, comments: [] },
      { id: "woo-dm-3", title: "zhvho24", body: "보고 싶다. 내일 끝나고 잠깐 볼래?\n想你了。明天工作結束後要不要見一下？", richText: "", meta: {}, time: "23:24", sender: "zhvho24", avatar: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23000'/%3E%3C/svg%3E", kind: "text" as const, media: "", hidden: false, unlock: "", password: "", folder: "私信", favorite: false, outgoing: false, read: false, likes: 0, comments: [] }
    ]],
    active = stories[story - 1];
  const toggle = (id: string, values: string[], set: (v: string[]) => void) =>
    set(values.includes(id) ? values.filter((v) => v !== id) : [...values, id]);
  useEffect(() => {
    if (!active) return;
    const t = setTimeout(
      () => setStory((n) => (n < stories.length ? n + 1 : 0)),
      5000,
    );
    return () => clearTimeout(t);
  }, [active, stories.length]);
  const openStory = (i: number) => {
    const m = stories[i];
    setSeen([...new Set([...seen, m.id])]);
    read(p, m);
    setStory(i + 1);
  };
  const openPost = (i: Item) => {
    if (p.creator || i.password) p.onItem(i);
    else {
      read(p, i);
      setSelected(i);
    }
  };
  const post = (i: Item) => (
    <article className="igp" key={i.id}>
      <header className="igph">
        <Avatar name={i.sender} src={i.avatar} />
        <div className="igpn">
          <button onClick={() => { setIgAccount(i.sender === "_imnnin" ? "public" : i.sender === "zhvho24" ? "private" : "lina"); setTab("个人主页"); }}>
            <b>{i.sender}</b>
          </button>
          <small>{i.meta.location || i.time}</small>
        </div>
        <button aria-label="帖子详情" onClick={() => openPost(i)}>
          <MoreHorizontal />
        </button>
      </header>
      <div
        className="carw"
        onDoubleClick={() => {
          if (!liked.includes(i.id)) setLiked([...liked, i.id]);
          setPop(i.id);
        }}
      >
        <Media item={i} />
        {pop === i.id && (
          <Heart
            className="mymy-heart-pop"
            fill="white"
            onAnimationEnd={() => setPop("")}
          />
        )}
      </div>
      <div className="iga">
        <button
          aria-label={"点赞" + i.title}
          aria-pressed={liked.includes(i.id)}
          onClick={() => toggle(i.id, liked, setLiked)}
        >
          <Heart
            fill={liked.includes(i.id) ? "#ff3040" : "none"}
            color={liked.includes(i.id) ? "#ff3040" : "currentColor"}
          />
        </button>
        <button
          aria-label={"评论" + i.title}
          onClick={() => {
            read(p, i);
            setSheet(i);
          }}
        >
          <MessageCircle />
        </button>
        <button aria-label="分享帖子" onClick={() => setTab("私信")}>
          <Send />
        </button>
        <button
          className="mymy-save"
          aria-label={"收藏" + i.title}
          aria-pressed={saved.includes(i.id)}
          onClick={() => toggle(i.id, saved, setSaved)}
        >
          <Bookmark fill={saved.includes(i.id) ? "currentColor" : "none"} />
        </button>
      </div>
      <p className="lk2">{i.likes + (liked.includes(i.id) ? 1 : 0)} 次赞</p>
      <button
        className="igc"
        onClick={() => {
          openPost(i);
        }}
      >
        <b>{i.sender}</b> {i.body}
      </button>
      <button className="cmall" onClick={() => setSheet(i)}>
        查看评论{" "}
        {i.comments.length +
          replies.filter((r) => r.startsWith(i.id + "\t")).length}
      </button>
      <p className="igt">{i.time}</p>
    </article>
  );
  return (
    <div className="mymy-ui mymy-instagram" data-mymy="instagram">
      <div className="ig">
        <header className="igh">
          <button
            aria-label={selected ? "返回Instagram动态" : "关闭当前App"}
            onClick={() => (selected ? setSelected(null) : p.onBack())}
          >
            <ArrowLeft />
          </button>
          <span className="igl2">
            {selected ? "帖子" : tab === "主页" ? "Instagram" : tab}
          </span>
          <button aria-label="打开私信" onClick={() => setTab("私信")}>
            <Send />
          </button>
        </header>
        <div className="igb">
          {selected && post(selected)}
          {!selected && tab === "主页" && (
            <>
              <div className="sts">
                {stories.map((s, n) => (
                  <button
                    className="st"
                    key={s.id}
                    onClick={() => openStory(n)}
                  >
                    <span
                      className={"sr on " + (seen.includes(s.id) ? "seen" : "")}
                    >
                      <Avatar name={s.sender} src={s.avatar} />
                    </span>
                    <small>{s.sender}</small>
                  </button>
                ))}
              </div>
              {allFeedPosts.map(post)}
              {!allFeedPosts.length && <Blank />}
            </>
          )}
          {!selected && tab === "个人主页" && (
            <>
              <div className="pf">
                <Avatar name={profile.name} src={profile.avatar || undefined} />
                <div className="ps">
                  <div>
                    <b>{profile.count}</b>
                    <small>帖子</small>
                  </div>
                  <div>
                    <b>{profile.followers}</b>
                    <small>粉丝</small>
                  </div>
                  <div>
                    <b>{profile.following}</b>
                    <small>关注</small>
                  </div>
                </div>
              </div>
              <p className="pn">{profile.handle}</p>
              {profile.bio && <p className="pn">{profile.bio}</p>}
              {igAccount === "private" && <p className="pn">🔒 私密帳號 · 與 linaaa_ 互相關注</p>}
              <div className="ig-account-switch">
                <button onClick={() => setIgAccount("lina")}>linaaa_</button>
                <button onClick={() => setIgAccount("public")}>_imnnin</button>
                <button onClick={() => setIgAccount("private")}>zhvho24</button>
              </div>
              <div className="ptab">
                <div className="on">
                  <Grid />
                </div>
              </div>
              <div className="pg2">
                {posts.map((i) => (
                  <button key={i.id} onClick={() => openPost(i)}>
                    <Media item={i} />
                  </button>
                ))}
              </div>
            </>
          )}
          {!selected && tab === "私信" && (
            <>
              {dms.map((i) => (
                <button className="kzkr" key={i.id} onClick={() => openPost(i)}>
                  <Avatar name={i.sender} src={i.avatar} />
                  <span className="kzkn">
                    <b>{i.title}</b>
                    <small>{i.body}</small>
                  </span>
                </button>
              ))}
              {!dms.length && <Blank />}
            </>
          )}
          {!selected && tab === "搜索" && (
            <>
              <input
                className="mymy-search"
                aria-label="搜索Instagram"
                placeholder="搜索"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              {posts
                .filter((i) => (i.title + i.body + i.sender).includes(draft))
                .map(post)}
            </>
          )}
        </div>
        <nav className="mymy-ig-nav">
          {[Home, Search, Send, User].map((Icon, n) => (
            <button
              key={n}
              aria-label={["主页", "搜索", "私信", "个人主页"][n]}
              aria-pressed={
                !selected && tab === ["主页", "搜索", "私信", "个人主页"][n]
              }
              onClick={() => {
                setSelected(null);
                setTab(["主页", "搜索", "私信", "个人主页"][n]);
              }}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
      {sheet && (
        <div className="kzcs">
          <button
            className="kzbk"
            aria-label="关闭评论"
            onClick={() => setSheet(null)}
          />
          <section className="kzsh" role="dialog" aria-label="Instagram评论">
            <div className="mymy-sheet-handle" />
            <header>
              <b>评论</b>
              <button aria-label="关闭评论面板" onClick={() => setSheet(null)}>
                <X />
              </button>
            </header>
            <div className="mymy-comments">
              {[
                ...sheet.comments,
                ...replies
                  .filter((r) => r.startsWith(sheet.id + "\t"))
                  .map((r) => r.split("\t").slice(1).join("\t")),
              ].map((c, n) => (
                <p key={n}>
                  <Avatar name={c.split(":")[0]} />
                  {c.includes("\\n") ? <>{c.split("\\n")[0]}<small className="mymy-comment-translation">{c.split("\\n").slice(1).join("\\n")}</small></> : <>{c}<small className="mymy-comment-translation">（中文翻譯：{c === "ㅋㅋㅋ 귀여워" ? "哈哈哈，好可愛" : c === "이 사진 진짜 좋아" ? "真的很喜歡這張照片" : "留言中文翻譯）"}</small></>}
                </p>
              ))}
            </div>
            <form
              className="cmb2"
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setReplies([...replies, sheet.id + "\t" + draft.trim()]);
                  setDraft("");
                }
              }}
            >
              <input
                aria-label="添加评论"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="添加评论"
                maxLength={500}
              />
              <button>发布</button>
            </form>
          </section>
        </div>
      )}
      {active && (
        <div
          className="mymy-story"
          onPointerDown={(e) => {
            const box = e.currentTarget.getBoundingClientRect();
            const next =
              e.clientX - box.left < box.width * 0.3 ? story - 1 : story + 1;
            setStory(next > stories.length ? 0 : Math.max(0, next));
          }}
        >
          <div className="mymy-story-bars">
            {stories.map((s, n) => (
              <i key={s.id} className={n < story ? "seen" : ""} />
            ))}
          </div>
          <header>
            <Avatar name={active.sender} src={active.avatar} />
            <b>{active.sender}</b>
            <button
              aria-label="关闭快拍"
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setStory(0)}
            >
              <X />
            </button>
          </header>
          <Media item={active} />
          <p>{active.body}</p>
        </div>
      )}
    </div>
  );
}
export function MymyX(p: SkinProps) {
  const [dark, setDark] = useSkinState<boolean>(p, "x-dark", true);
  const [tab, setTab] = useSkinState<string>(p, "mymyTab", "推荐"),
    [likes, setLikes] = useSkinState<string[]>(p, "mymyXLikes", []),
    [reposts, setReposts] = useSkinState<string[]>(p, "mymyXReposts", []),
    [marks, setMarks] = useSkinState<string[]>(p, "mymyXMarks", []),
    [query, setQuery] = useState("");
  const isLiked = (id: string) =>
    typeof p.ui?.["liked-" + id] === "boolean"
      ? Boolean(p.ui["liked-" + id])
      : likes.includes(id);
  const isSaved = (id: string) =>
    typeof p.ui?.["saved-" + id] === "boolean"
      ? Boolean(p.ui["saved-" + id])
      : marks.includes(id);
  const toggle = (id: string, v: string[], set: (x: string[]) => void) =>
    set(v.includes(id) ? v.filter((x) => x !== id) : [...v, id]);
  return (
    <div
      className={"mymy-ui mymy-x " + (dark ? "x-reference-dark" : "")}
      data-mymy="twitter"
    >
      <div className="kzxw">
        <header className="kzxh">
          <button aria-label="关闭当前App" onClick={p.onBack}>
            <ArrowLeft />
          </button>
          <div className="kzxlg">𝕏</div>
          <button aria-label="切换X外观" onClick={() => setDark(!dark)}>
            <User />
          </button>
        </header>
        <div className="kzxtb">
          {["为你推荐", "正在关注", "添加 +", "时间"].map((t) => (
            <button
              className={t === tab ? "on" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {tab === "搜索" && (
          <input
            className="mymy-search"
            aria-label="搜索X"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索"
          />
        )}
        <div className="kzxfd">
          {p.items
            .filter((i) => (i.title + i.body).includes(query))
            .map((i) => (
              <article className="kzxt" key={i.id}>
                <Avatar name={i.sender} src={i.avatar} />
                <div className="kzxb">
                  <div className="kzxn">
                    <b>{i.sender}</b>
                    <small>
                      @{i.meta.handle || "user"} · {i.time.slice(-5)}
                    </small>
                    <em>
                      <MoreHorizontal size={18} />
                    </em>
                  </div>
                  <button
                    className="kzxx"
                    onClick={() => {
                      read(p, i);
                      p.onItem(i);
                    }}
                  >
                    {i.body}
                  </button>
                  {i.media && (
                    <button
                      className="kzxv"
                      aria-label="打开媒体"
                      onClick={() => p.onItem(i)}
                    >
                      <Media item={i} />
                    </button>
                  )}
                  <div className="kzxac">
                    <button
                      aria-label={"评论" + i.title}
                      onClick={() => p.onItem(i)}
                    >
                      <MessageCircle />
                      {i.comments.length}
                    </button>
                    <button
                      aria-label={"转发" + i.title}
                      aria-pressed={reposts.includes(i.id)}
                      onClick={() => toggle(i.id, reposts, setReposts)}
                    >
                      <Repeat2 />
                      {reposts.includes(i.id) ? 1 : 0}
                    </button>
                    <button
                      aria-label={"点赞" + i.title}
                      aria-pressed={isLiked(i.id)}
                      onClick={() => {
                        toggle(i.id, likes, setLikes);
                        p.onUi?.("liked-" + i.id, !isLiked(i.id));
                      }}
                    >
                      <Heart fill={isLiked(i.id) ? "#f91880" : "none"} />
                      {i.likes + (isLiked(i.id) ? 1 : 0)}
                    </button>
                    <span>
                      <BarChart2 />
                      {i.meta.views || "—"}
                    </span>
                    <button
                      aria-label={"收藏" + i.title}
                      aria-pressed={isSaved(i.id)}
                      onClick={() => {
                        toggle(i.id, marks, setMarks);
                        p.onUi?.("saved-" + i.id, !isSaved(i.id));
                      }}
                    >
                      <Bookmark />
                    </button>
                    <button aria-label="分享" onClick={() => p.onItem(i)}>
                      <Share />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          {!p.items.length && <Blank />}
        </div>
        <nav className="kzxnav">
          {[Home, Search, Bell, MessageCircle].map((Icon, n) => (
            <button
              key={n}
              aria-label={["时间线", "搜索", "通知", "私信"][n]}
              onClick={() => n < 2 && setTab(n ? "搜索" : "推荐")}
              disabled={n > 1}
            >
              <Icon />
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
