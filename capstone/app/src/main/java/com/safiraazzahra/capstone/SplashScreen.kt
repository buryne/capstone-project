import android.content.Intent
import android.os.Bundle
import android.os.Handler
import androidx.appcompat.app.AppCompatActivity
import com.google.firebase.auth.FirebaseAuth
import com.safiraazzahra.capstone.MainActivity
import com.safiraazzahra.capstone.databinding.ActivitySplashScreenBinding // Import the correct binding

class SplashScreenActivity : AppCompatActivity() { // Rename the class to SplashScreenActivity
    private lateinit var splashScreenBinding: ActivitySplashScreenBinding
    private lateinit var firebaseAuth: FirebaseAuth

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        splashScreenBinding = ActivitySplashScreenBinding.inflate(layoutInflater)
        setContentView(splashScreenBinding.root)

        val handler = Handler(mainLooper)

        handler.postDelayed({
            val intent = Intent(this@SplashScreenActivity, MainActivity::class.java)
            startActivity(intent)
            finish()
        }, 5000L)

        supportActionBar?.hide()
    }
}
