#!/usr/bin/env bb

(require
  '[clojure.java.io :as io]
  '[clojure.string :as str]
  '[cheshire.core :as json])


(def BASE "ChatExport_2021-11-25/")

(def DATA (json/parse-string (slurp (str BASE "result.json")) keyword))


(defn uniq-dir [path x]
  (if (.exists (io/file (str path (when x (str "-" x)))))
    (recur path (inc (or x 0)))
    (str path (when x (str "-" x)))))


(defn upgrade-html [s]
  (-> s
      (str/replace "• " "* ")))


(defn convert-text [i t]
  (case (:type t)
    nil             (upgrade-html t)
    "italic"        (format "*%s*" (:text t))
    "bold"          (if (zero? i)
                      (format "# %s" (:text t))
                      (format "**%s**" (:text t)))
    "code"          (format "`%s`" (:text t))
    "strikethrough" (format "<s>%s</s>" (:text t))
    "link"          (format "[%s](%s)" (:text t) (:text t))
    "mention"       (format "[%s](https://t.me/%s)" (:text t) (.substring (:text t) 1))
    "text_link"     (if (<= (count (:text t)) 2)
                      (format "![](%s)\n" (:href t))
                      (format "[%s](%s)\n" (:text t) (:href t)))))


(defn write-message [m]
  (let [date         (-> (:date m)
                         (.split "T")
                         (first)
                         (.replace "-" ""))
        dirname      (uniq-dir (str "src/channel/" date) nil)
        [title text] (let [text (:text m)
                           ft   (first text)]
                       (if (= (:type ft) "bold")
                         [(:text ft) (rest text)]
                         [nil text]))
        text         (apply str (map-indexed convert-text text))
        photo        (some-> (:photo m)
                       (.replace "photos/" ""))
        header       (cond->> (format "date: %s\ntgid: %s\n----\n\n"
                                (.replace (:date m) "T" " ")
                                (:id m))
                       title (str "title: " title "\n"))]
    (.mkdirs (io/file dirname))
    (spit (io/file dirname "index.md")
      (str
        header
        (when photo
          (format "![](%s)\n\n" photo))
        text))
    (when photo
      (io/copy
        (io/file BASE "photos" photo)
        (io/file dirname photo)))))

(->> (:messages DATA)
     (filter #(= (:type %) "message"))
     (run! write-message))
