pub fn form_composite_key(key1: [u8; 32], key2: [u8; 32]) -> [u8; 32] {
    let mut symmetric_key: [u8; 32] = [0; 32];

    for i in 0..key1.len() {
        symmetric_key[i] = key1[i] | key2[i];
    }

    symmetric_key
}
