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
  '[org.httpkit.client :as http])


(when (empty? *command-line-args*)
  (println "Supply type and url to post as arguments")
  (System/exit 1))


(def TYPE (first *command-line-args*))
(def URL (second *command-line-args*))
(def TGID (second (next *command-line-args*)))


;;; Getting data

(defn throw-not200 [res]
  (when (not= (:status res) 200)
    (throw (ex-info "Error getting data" {:status   (:status res)
                                          :response res})))
  res)


(def _POST (-> @(http/get URL)
              throw-not200
              :body
              (json/parse-string keyword)))
(def POST (case TYPE
            "xapicms" (assoc _POST :tgid TGID)
            "nounry"  (merge _POST
                        {:tags         ["channel"]
                         :tgid         (->> (:publications _POST)
                                            (filter #(= "telegram" (:service %)))
                                            first
                                            :data
                                            :message_id
                                            str)
                         :published_at (-> (:publications _POST) first :created_at)})))

(println "---------------- Post " (:status POST))
(clojure.pprint/pprint POST)


;;; Funs

(def year-fmt (DateTimeFormatter/ofPattern "yyyy"))
(def date-fmt (DateTimeFormatter/ofPattern "yyyyMMdd"))
(def datetime-fmt (DateTimeFormatter/ofPattern "yyyy-MM-dd HH:mm:ss"))


(defn format-date [fmt date]
  (let [date       (OffsetDateTime/parse date)
        local-date (.atZoneSameInstant date (ZoneId/of "Europe/Kiev"))]
    (.format local-date fmt)))


(defn make-header [post]
  (let [tags (remove #{"blog"} (:tags post))]
    (->> [(when (:title post) (str "title: " (:title post)))
          (str "date: " (format-date datetime-fmt
                          (or (:published_at post)
                              (:created_at post))))
          (when (seq (:uuid post)) (str "uuid: " (:uuid post)))
          (when (seq (:tgid post)) (str "tgid: " (:tgid post)))
          (when (seq tags) (str "tags: " (str/join ", " tags)))]
         (filter identity)
         (str/join "\n"))))


(defn post->gostatic [post]
  (str (make-header post)
    "\n----\n\n"
    (when (:feature_image post)
      (format "<img src=\"%s\">\n\n" (:feature_image post)))
    (or (:html post)
        (:text post))))


(defn store-post!  [post]
  (let [mode (cond
               (some #{"channel"} (:tags post)) :channel
               (some #{"blog"} (:tags post))    :blog
               :else                            (System/exit 1))
        path (case mode
               :channel (format "src/channel/%s.%s.html"
                          (format-date date-fmt (or (:published_at post)
                                                    (:created_at post)))
                          (:uuid post))
               :blog    (format "src/blog/%s/%s.html"
                          (format-date year-fmt (or (:published_at post)
                                                    (:created_at post)))
                          (or (:slug post)
                              (:uuid post))))
        text (post->gostatic post)]
    (io/make-parents path)
    (spit path text)
    path))


;;; Action

(println "\n--------------- Saved")
(println (store-post! POST))
