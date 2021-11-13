#!/usr/bin/env bb

(require
  '[clojure.pprint]
  '[clojure.string :as str]
  '[clojure.edn :as edn]
  '[cheshire.core :as json]
  '[org.httpkit.client :as http])


(when (empty? *command-line-args*)
  (println "Supply url to post as a first argument")
  (System/exit 1))


(def URL (first *command-line-args*))
(def TOKEN (System/getenv "TGTOKEN"))
(def TGBASE (str "https://api.telegram.org/bot" TOKEN))
(def DRAFT "-1001224071964")
(def PUB "@bitethebyte")
(def MSGIDS (atom (edn/read-string (slurp "msgids.edn"))))


;; (when (empty? TOKEN)
;;   (println "Define $TGTOKEN environment variable!")
;;   (System/exit 1))


;;; Getting data

(defn throw-not200 [res]
  (when (not= (:status res) 200)
    (throw (ex-info "Error getting data" {:status   (:status res)
                                          :response res})))
  res)


(def POST (-> @(http/get URL)
              throw-not200
              :body
              (json/parse-string keyword)))
(def TYPE (if (= (:status POST) "published") :pub :draft))

(println "Post ---------------- " TYPE)
(clojure.pprint/pprint POST)


;;; Funs

(defn save-id [slug id]
  (swap! MSGIDS assoc-in [TYPE slug] id)
  (spit "msgids.edn" (pr-str @MSGIDS)))


(defn get-id [slug]
  (get-in @MSGIDS [TYPE slug]))


(defn sanitize-html [html]
  (-> html
      (str/replace #"(?s)<ul>(.*?)</ul>"
        (fn [[_ m]]
          (-> m
              (str/replace "<li>" " • ")
              (str/replace #"\n*</li>\n?" "\n"))))
      (str/replace #"(?s)<ol>(.*?)</ol>"
        (fn [[_ m]]
          (let [*i (atom 0)]
            (-> m
                (str/replace #"<li>" (fn [_]
                                       (str (swap! *i inc) ". ")))
                (str/replace #"\n*</li>\n?" "\n")))))
      (str/replace "<p>" "")
      (str/replace "</p>" "\n")
      (str/replace #"\n\n+" "\n\n")))


(defn make-tg-post [post]
  (cond->> (sanitize-html (:html post))
    (:title post)
    (str (format "<b>%s</b>\n\n" (:title post)))

    (:feature_image post)
    (str (format "<a href=\"%s\">&#8205;</a>\n" (:feature_image post)))))


(defn tg-req [post]
  (let [id     (get-id (:slug post))
        form   {:chat_id                  (if (= TYPE :pub) PUB DRAFT)
                :message_id               id
                :parse_mode               "HTML"
                :text                     (make-tg-post post)
                ;; only show preview when I've supplied an image
                :disable_web_page_preview (nil? (:feature_image post))}
        method (if id
                 "/editMessageText"
                 "/sendMessage")]
    {:method      :post
     :url         (str TGBASE method)
     :form-params form}))


;;; Action

(let [req  (tg-req POST)
      res  @(http/request req)
      data (-> res :body (json/parse-string keyword))]
  (println "Telegram response --------------")
  (clojure.pprint/pprint data)
  (when-not (:ok data)
    (System/exit 1))
  (save-id (:slug POST) (-> data :result :message_id)))
