package com.Upeksha.Voting_System.service;

import org.springframework.stereotype.Service;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;

@Service
public class BackupService {

    private static final String JDBC_URL = "jdbc:h2:file:./data/upeksha";
    private static final String USER = "Upeksha";
    private static final String PASSWORD = "1234";

    public void backup(String backupFilePath) {
        try (Connection conn = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
             Statement stmt = conn.createStatement()) {

            stmt.execute("SCRIPT TO '" + backupFilePath + "'");
            System.out.println("✅ Backup created at: " + backupFilePath);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

        public void restore(String backupFilePath) {
            try (Connection conn = DriverManager.getConnection(JDBC_URL, USER, PASSWORD);
                 Statement stmt = conn.createStatement()) {

                stmt.execute("RUNSCRIPT FROM '" + backupFilePath + "'");
                System.out.println("🔄 Restore completed from: " + backupFilePath);

            } catch (Exception e) {
                e.printStackTrace();
            }
        }


}
