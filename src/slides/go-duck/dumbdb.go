package main

import (
	"os"
	"net/http"
	"path/filepath"
	"io/ioutil"
	"encoding/json"
	"strconv"
)

var DIR string

func getContent(name string) map[string]string {
	data, err := ioutil.ReadFile(filepath.Join(DIR, name))
    if err == nil {
    	return map[string]string{"content": string(data)}
    }
    return map[string]string{"error": "data not found"}
}

func Responder(w http.ResponseWriter, req *http.Request) {
	name := req.FormValue("id")
	data, _ := json.Marshal(getContent(name))
	w.Write(data)
}

func main() {
	if len(os.Args) == 1 {
		println("Supply path to directory with data as first argument")
		return
	}
	DIR = os.Args[1]

	http.HandleFunc("/", Responder)
	http.ListenAndServe(":8081", nil)
}
