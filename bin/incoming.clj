#!/usr/bin/env bb

(import
  'java.time.format.DateTimeFormatter
  'java.time.OffsetDateTime
  'java.time.ZoneId)

(require
  '[clojure.pprint]
  '[clojure.string :as str]
  '[clojure.java.io :as io]
  '[cheshire.core :as json]
  '[org.httpkit.client :as http]
  '[babashka.process :as p])


(when (empty? *command-line-args*)
  (println "Supply url to post as a first argument")
  (System/exit 1))


(def URL (first *command-line-args*))
(def TGID (second *command-line-args*))


;;; Getting data

(defn throw-not200 [res]
  (when (not= (:status res) 200)
    (throw (ex-info "Error getting data" {:status   (:status res)
                                          :response res})))
  res)


(def POST (-> @(http/get URL)
              throw-not200
              :body
              (json/parse-string keyword)
              (assoc :tgid TGID)))

(println "Post ---------------- " (:status POST))
(clojure.pprint/pprint POST)


;;; Funs

(def date-fmt (DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm:ss"))

(defn format-date [date]
  (let [date       (OffsetDateTime/parse date)
        local-date (.atZoneSameInstant date (ZoneId/of "Europe/Kiev"))]
    ;; rework to add 2 hours
    (-> (.format local-date date-fmt)
        (str/replace "T" " ")
        (str/replace "Z" ""))))


(defn make-header [post]
  (->> [(when (:title post) (str "title: " (:title post)))
        (str "date: " (format-date (or (:published_at post)
                                       (:created_at post))))
        (when (:tgid post) (str "tgid: " (:tgid post)))
        "----\n\n"]
       (filter identity)
       (str/join "\n")))


(defn store-post!  [post]
  (let [path (str "src/channel/" (:uuid post) ".html")
        text (str (make-header post)
               (:html post))]
    (spit (io/file path) text)
    path))


;;; Action

(println "\nSaved ---------------")
(def SAVED (store-post! POST))
(println SAVED)

(let [res @(p/process ["git" "add" SAVED] {:out :inherit})]
  (System/exit (:exit res)))
