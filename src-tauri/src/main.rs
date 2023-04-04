// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn calculate_winner(squares: Vec<String>) -> String {
    const LINES: [[usize; 3]; 8] = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];
    for line in LINES.iter() {
        let a = line[0];
        let b = line[1];
        let c = line[2];
        if squares[a] != String::from("") && squares[a] == squares[b] && squares[a] == squares[c] {
            return squares[a].clone();
        }
    }
    return String::from("");
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            calculate_winner
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
